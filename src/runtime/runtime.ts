import { createHash } from 'node:crypto';
import { DurableExecution, LoadedState, RuntimeConfiguration, RuntimeSnapshot, GenesisInput, ENGINE_VERSION, OperationPayload, canonical } from '../persistence';
import { validateRuntimeConfiguration, createRuntimeEvidence } from '../persistence/runtime-evidence';
import { immutable, same } from '../budget/reservations';
import { requireBudget } from '../budget/limits';
import { authorizeEntryBatch, createAuthorizationState, ClosedPriceReference } from '../budget';
import { coordinateEntryBatch, CoordinatorState } from '../coordination';
import { Asset, ASSETS, Candle } from '../simulation/candle';
import { SimulationClock } from '../simulation/clock';
import { createMarketSource, MarketSource } from '../simulation/market-source';
import { ExecutionState, ExecutionCommand, prepareSimulatedDecision, acceptAuthorizations, processOpening, processClosedCandle, cancelActiveReservation } from '../operations';
import { evaluateStrategicExits } from './strategic-exits';
import { BoundaryAnalysis, OperationalSnapshot, RuntimeMode } from './types';

/** Composition only: D1 calls C3, which calls C2/indicators/hourly/context. */
export function analyzeBoundary(state:ExecutionState,history:Readonly<Record<Asset,readonly Candle[]>>,config:Pick<RuntimeConfiguration,'policies'|'context'> & {readonly provider:{readonly initialPrices:Readonly<Record<Asset,string>>}},coordinator:CoordinatorState,entriesEnabled:boolean):BoundaryAnalysis {
  const context={status:config.context.feed.status,events:config.context.feed.status==='VALID'?config.context.feed.events.filter(event=>
    Date.parse(event.publishedAt)<=Date.parse(state.asOf) && Date.parse(event.availableAt)<=Date.parse(state.asOf)):[]};
  const decisions=entriesEnabled?ASSETS.map(asset=>prepareSimulatedDecision(history[asset],state.asOf,context,config.policies[asset],
    {asset,asOf:state.asOf,status:state.portfolio.positions[asset]})):[];
  const exits=evaluateStrategicExits(state,history,state.asOf);
  const coordination=coordinateEntryBatch(decisions,state.asOf,coordinator);
  const prices=Object.fromEntries(ASSETS.map(asset=>{
    const last=history[asset].at(-1);
    // Initial known prices are explicitly NOT closed-price evidence; empty warmup batches never consume them.
    return [asset,{asset,closeTime:last?.closeTime??state.asOf,close:last?.close??config.provider.initialPrices[asset],validatedClosed:last!==undefined}];
  })) as Record<Asset,ClosedPriceReference>;
  return immutable({decisions,exits,coordination,authorization:authorizeEntryBatch(coordination,state.portfolio,prices,createAuthorizationState(state.portfolio),state.asOf)});
}

export class SimulationRuntime {
  private current:LoadedState|null=null;
  private mode:RuntimeMode='PAUSED';
  private diagnostic:string|null=null;
  private closed=false;
  constructor(private readonly store:DurableExecution){}
  private initialized():LoadedState {
    requireBudget(!this.closed && this.current && this.current.runtime,'Explicit runtime initialization/resume required');return this.current;
  }
  private source(rt:RuntimeSnapshot):MarketSource {
    const source=createMarketSource(new SimulationClock(rt.configuration.startTime),rt.configuration.provider);
    for(let i=0;i<rt.confirmedSteps;i++){
      const batch=source.next();requireBudget(batch.every(c=>same(c,rt.history[c.asset][i])),'Confirmed runtime history differs during source reconstruction');
    }
    return source;
  }
  create(input:RuntimeConfiguration,coordinatorState:CoordinatorState):OperationalSnapshot {
    requireBudget(!this.closed && this.current===null,'Runtime already initialized/closed');
    const c=validateRuntimeConfiguration(input),zero='0.00000000';
    this.store.createSimulation({simulationId:c.simulationId,operationId:'runtime-genesis',initial:{asOf:c.startTime,state:'RUNNING',equity:c.initialCapital,
      dayOpeningEquity:c.initialCapital,availableCash:c.initialCapital,reservedCash:zero,committedExposure:{BTC:zero,ETH:zero},committedRisk:zero,
      positions:{BTC:'FLAT',ETH:'FLAT'},reservations:{BTC:'NONE',ETH:'NONE'}},configuration:{engineVersion:ENGINE_VERSION,coordinatorState,
      clock:{startTime:c.startTime,currentTime:c.startTime,steps:0},generator:{version:c.provider.version,seed:c.provider.seed,confirmedSteps:0},runtime:c}});
    return this.resume(c.simulationId);
  }
  resume(simulationId:string):OperationalSnapshot {
    requireBudget(!this.closed && (this.current===null || this.current.runtime?.simulationId===simulationId),'Cannot switch runtime simulation');
    this.mode='RECOVERING';
    try{
      const loaded=this.store.recover(simulationId);requireBudget(loaded.runtime,'Legacy financial recovery has no reproducible runtime origin');this.current=loaded;
      evaluateStrategicExits(loaded.state,loaded.runtime.history,loaded.state.asOf);
      this.source(loaded.runtime);this.current=loaded;this.mode='PAUSED';this.diagnostic=null;return this.snapshot();
    }catch(e){this.mode='BLOCKED';this.diagnostic=String(e);
      try{this.store.suspendEntries(simulationId,'RUNTIME_RECOVERY_FAILURE');if(this.current)this.current=this.store.loadState(simulationId);}catch{/* D5 may already be locally blocked. */}
      throw e;}
  }
  start():OperationalSnapshot {
    const s=this.initialized();requireBudget(this.mode!=='BLOCKED' && ['RUNNING','ENTRY_SUSPENDED'].includes(s.control.status),'Runtime blocked; explicit verified resume required');
    if(s.runtime!.version==='2' && s.runtime!.exhausted){this.mode='PAUSED';this.diagnostic='SOURCE_EXHAUSTED';return this.snapshot();}
    this.mode=s.runtime!.warmup.ready?'READY':'WARMING_UP';return this.snapshot();
  }
  pause():OperationalSnapshot {this.initialized();requireBudget(this.mode!=='BLOCKED','Runtime blocked');this.mode='PAUSED';return this.snapshot();}
  snapshot():OperationalSnapshot {return immutable({mode:this.mode,confirmed:this.initialized(),diagnostic:this.diagnostic});}
  private commit(command:ExecutionCommand,coordinator:BoundaryAnalysis['coordination']|null):void {
    const before=this.initialized(),rt=before.runtime!,config=rt.configuration;
    const next=command.kind==='AUTHORIZE'?acceptAuthorizations(before.state,command.authorization):command.kind==='OPEN'?processOpening(before.state,command.openings,command.exits,command.asOf)
      :command.kind==='CLOSE'?processClosedCandle(before.state,command.candles,command.asOf):cancelActiveReservation(before.state,command.reservationId,command.reason,command.asOf);
    const steps=(Date.parse(next.asOf)-Date.parse(config.startTime))/300000;
    const clock={startTime:config.startTime,currentTime:next.asOf,steps},generator={version:config.provider.version,seed:config.provider.seed,confirmedSteps:steps};
    const cursor={asOf:next.asOf,phase:next.phase,clock,generator,coordinatorState:coordinator?.nextState??before.control.cursor.coordinatorState,
      authorizedAt:command.kind==='AUTHORIZE'?next.asOf:command.kind==='CLOSE'?null:before.control.cursor.authorizedAt};
    // Projection for the pure RUNTIME-001 verifier; does not replace or persist the original genesis.
    const origin:GenesisInput={simulationId:config.simulationId,operationId:'runtime-genesis',initial:before.state.initial,
      configuration:{engineVersion:ENGINE_VERSION,coordinatorState:before.control.cursor.coordinatorState,
        clock:{startTime:config.startTime,currentTime:config.startTime,steps:0},generator:{version:config.provider.version,seed:config.provider.seed,confirmedSteps:0},runtime:config}};
    const payload:OperationPayload={command,evidence:{coordinator,clock,generator,runtime:createRuntimeEvidence(origin,next,cursor)}};
    const operationId='runtime-'+createHash('sha256').update(canonical([config.simulationId,command.id])).digest('hex');
    const receipt=this.store.commitOperation({simulationId:config.simulationId,operationId,expectedRevision:before.control.revision,payload:canonical(payload)});
    this.current=this.store.loadState(config.simulationId);
    requireBudget(this.current.control.revision===receipt.revision,'Concurrent runtime advancement beyond confirmed receipt');
  }
  advanceCycle(expectedRevision:string):OperationalSnapshot {
    const initial=this.initialized();requireBudget(this.mode==='READY' || this.mode==='WARMING_UP','Explicit start required before advancing');
    try{this.current=this.store.loadState(initial.runtime!.simulationId);}catch(e){this.mode='BLOCKED';this.diagnostic=String(e);throw e;}
    if(this.current.control.revision!==expectedRevision){this.mode='PAUSED';this.diagnostic='Obsolete runtime revision';throw new RangeError(this.diagnostic);}
    if(this.current.runtime!.version==='2' && this.current.runtime!.exhausted){this.mode='PAUSED';this.diagnostic='SOURCE_EXHAUSTED';return this.snapshot();}
    try{
      requireBudget(['RUNNING','ENTRY_SUSPENDED'].includes(this.current.control.status),'Financial recovery gate blocks processing');
      if(this.current.state.phase==='BEFORE_OPEN'){
        if(this.current.control.status==='ENTRY_SUSPENDED')for(const r of this.current.state.reservations.filter(r=>r.status==='ACTIVE'))
          this.commit({id:JSON.stringify(['CANCEL',r.source.id]),kind:'CANCEL',asOf:this.current.state.asOf,reservationId:r.source.id,reason:'ENTRY_SUSPENDED'},null);
        requireBudget(this.current.runtime!.warmup.ready || !this.current.state.reservations.some(r=>r.status==='ACTIVE'),'Warmup incomplete: active entry authorization cannot execute');
        let exits:BoundaryAnalysis['exits'];
        if(this.current.control.cursor.authorizedAt!==this.current.state.asOf){
          const c=this.current.runtime!.configuration;
          const a=analyzeBoundary(this.current.state,this.current.runtime!.history,{policies:c.policies,context:c.context,provider:{initialPrices:c.provider.initialPrices}},this.current.control.cursor.coordinatorState,
            this.current.runtime!.warmup.ready && this.current.control.status==='RUNNING');
          exits=a.exits;
          this.commit({id:JSON.stringify(['AUTHORIZE',this.current.state.asOf]),kind:'AUTHORIZE',authorization:a.authorization},a.coordination);
        }else exits=evaluateStrategicExits(this.current.state,this.current.runtime!.history,this.current.state.asOf);
        const source=this.source(this.current.runtime!),time=this.current.state.asOf;
        this.commit({id:JSON.stringify(['OPEN',time]),kind:'OPEN',asOf:time,openings:source.currentOpenings(),exits},null);
      }
      const source=this.source(this.current.runtime!),candles=source.next(),time=candles[0].closeTime;
      this.commit({id:JSON.stringify(['CLOSE',time]),kind:'CLOSE',asOf:time,candles},null);
      if(this.current.runtime!.version==='2' && this.current.runtime!.exhausted){this.mode='PAUSED';this.diagnostic='SOURCE_EXHAUSTED';}
      else this.mode=this.current.runtime!.warmup.ready?'READY':'WARMING_UP';return this.snapshot();
    }catch(e){
      this.diagnostic=String(e);this.mode='BLOCKED';
      try{this.current=this.store.recover(initial.runtime!.simulationId);this.store.suspendEntries(initial.runtime!.simulationId,'RUNTIME_PROCESSING_FAILURE');
        this.current=this.store.loadState(initial.runtime!.simulationId);}catch{/* Keep only the last confirmed snapshot; never publish speculative D4/source state. */}
      throw e;
    }
  }
  close():void {if(!this.closed){this.store.close();this.closed=true;}}
}

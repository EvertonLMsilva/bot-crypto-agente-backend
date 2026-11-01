import { createHash } from 'node:crypto';
import { immutable, same } from '../budget/reservations';
import { budgetCycleTime, requireBudget } from '../budget/limits';
import { parseFixed8 } from '../budget/fixed8';
import { ASSETS, Asset, Candle } from '../simulation/candle';
import { SimulationClock } from '../simulation/clock';
import { SeededGenerator } from '../simulation/seeded-generator';
import { TECHNICAL_FAMILIES } from '../strategies/types';
import { contextC } from '../signals/context';
import { ExecutionState } from '../operations/execution-types';
import { Cursor, GenesisInput, OperationPayload, RuntimeConfiguration, RuntimeEvidence, RuntimeSnapshot, WarmupProgress } from './types';

const digest=(v:unknown):string=>createHash('sha256').update(JSON.stringify(immutable(v))).digest('hex');
function keys(value:object, expected:string[]):void {
  requireBudget(value && typeof value==='object' && same(Object.keys(value).sort(),expected.sort()),'Incomplete/version-incompatible runtime structure');
}
function id(value:string):void {requireBudget(typeof value==='string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(value),'Invalid runtime identity');}

/** Frozen genesis manifest, without defaults or changes to approved policy. */
export function validateRuntimeConfiguration(input:RuntimeConfiguration):RuntimeConfiguration {
  const c=immutable(input);
  keys(c,['version','simulationId','startTime','initialCapital','provider','policies','context','warmup']);
  requireBudget(c.version==='1','Unsupported runtime configuration version');id(c.simulationId);
  requireBudget(budgetCycleTime(c.startTime)===c.startTime && parseFixed8(c.initialCapital)>0n,'Invalid runtime origin');
  keys(c.provider,['id','version','seed','initialPrices']);keys(c.provider.initialPrices,['BTC','ETH']);
  requireBudget(c.provider.id==='seeded-generator' && c.provider.version==='1' && typeof c.provider.seed==='string' && c.provider.seed.trim().length>0,'Unsupported runtime provider');
  for(const asset of ASSETS)requireBudget(parseFixed8(c.provider.initialPrices[asset])>0n,'Invalid explicit initial price');
  keys(c.policies,['BTC','ETH']);
  for(const asset of ASSETS){
    const p=c.policies[asset];keys(p,['id','version','asset','state','families']);id(p.version);
    requireBudget(p.id===`${asset}-P0` && p.asset===asset && p.state==='UNVALIDATED' && Array.isArray(p.families) && p.families.length===3,'Invalid runtime P0 policy');
    const families=new Set<string>(),ids=new Set<string>();
    for(const f of p.families){keys(f,['family','id','version']);id(f.id);id(f.version);
      requireBudget(TECHNICAL_FAMILIES.includes(f.family) && !families.has(f.family) && !ids.has(f.id),'Invalid runtime family');families.add(f.family);ids.add(f.id);}
  }
  keys(c.context,['id','version','feed']);id(c.context.id);id(c.context.version);keys(c.context.feed,['status','events']);
  requireBudget(['VALID','INVALID'].includes(c.context.feed.status) && Array.isArray(c.context.feed.events),'Invalid reproducible contextual origin');
  if(c.context.feed.status==='VALID')for(const asset of ASSETS)requireBudget(contextC(c.context.feed,asset,c.startTime).status==='VALID','Malformed contextual source');
  keys(c.warmup,['hourlyCandles']);requireBudget(c.warmup.hourlyCandles===150,'Approved warmup is 150 complete hours');
  return c;
}

export function validateRuntimeGenesis(g:GenesisInput):void {
  if(!Object.hasOwn(g.configuration,'runtime'))return;
  const c=validateRuntimeConfiguration(g.configuration.runtime!);
  requireBudget(c.simulationId===g.simulationId && c.startTime===g.initial.asOf && c.initialCapital===g.initial.equity
    && c.startTime===g.configuration.clock.startTime && g.configuration.clock.steps===0
    && c.provider.seed===g.configuration.generator.seed && c.provider.version===g.configuration.generator.version,'Runtime and D5 origins differ');
}

/** Counts complete UTC hours independently, never synthesizing missing bars. */
export function warmupProgress(history:Readonly<Record<Asset,readonly Candle[]>>,startTime:string):WarmupProgress {
  const start=budgetCycleTime(startTime),parts={} as Record<Asset,WarmupProgress['BTC']>;
  for(const asset of ASSETS){
    let expected=start,count=0,hourBars=0;
    for(const c of history[asset]){
      requireBudget(c.asset===asset && c.openTime===expected && budgetCycleTime(c.closeTime)===c.closeTime
        && Date.parse(c.closeTime)-Date.parse(c.openTime)===300000,'Discontinuous/mixed warmup history');
      const o=parseFixed8(c.open),h=parseFixed8(c.high),l=parseFixed8(c.low),p=parseFixed8(c.close);parseFixed8(c.volume);
      requireBudget(l>0n && l<=o && l<=p && h>=o && h>=p && h>=l,'Invalid warmup OHLCV');
      if(Date.parse(c.openTime)%3600000===0)hourBars=0;
      hourBars++;
      if(Date.parse(c.closeTime)%3600000===0 && hourBars===12)count++;
      expected=c.closeTime;
    }
    parts[asset]={closed5m:history[asset].length,completeHours:count,ready:count>=150};
  }
  return immutable({...parts,ready:parts.BTC.ready && parts.ETH.ready});
}

/** Replays only confirmed commands. No generator instance escapes in snapshots. */
export function reconstructRuntime(g:GenesisInput,state:ExecutionState,cursor:Cursor):RuntimeSnapshot|undefined {
  if(!Object.hasOwn(g.configuration,'runtime'))return undefined;
  validateRuntimeGenesis(g);const c=validateRuntimeConfiguration(g.configuration.runtime!);
  const clock=new SimulationClock(c.startTime),source=new SeededGenerator(clock,c.provider);
  const history:Record<Asset,Candle[]>={BTC:[],ETH:[]};let phase:ExecutionState['phase']='BEFORE_OPEN';
  for(const command of state.commands){
    if(command.kind==='OPEN'){
      requireBudget(phase==='BEFORE_OPEN' && same(command.openings,source.currentOpenings()),'Runtime opening differs from known provider boundary');phase='AFTER_OPEN';
    }else if(command.kind==='CLOSE'){
      requireBudget(phase==='AFTER_OPEN','Runtime close without confirmed opening');
      const batch=source.next();requireBudget(same(command.candles,batch),'Reproduced confirmed candle differs from provider');
      for(const candle of batch)history[candle.asset].push(candle);phase='BEFORE_OPEN';
    }else requireBudget(phase==='BEFORE_OPEN','Runtime authorization/cancellation outside boundary');
  }
  requireBudget(same(clock.snapshot(),cursor.clock) && cursor.generator.confirmedSteps===clock.snapshot().steps
    && cursor.generator.seed===c.provider.seed && cursor.generator.version===c.provider.version
    && cursor.asOf===clock.snapshot().currentTime && cursor.phase===phase && state.phase===phase && state.asOf===cursor.asOf,'Impossible runtime cursor/phase');
  return immutable({version:'1',simulationId:g.simulationId,configHash:digest(c),provider:{id:c.provider.id,version:c.provider.version},
    asOf:cursor.asOf,phase,confirmedSteps:clock.snapshot().steps,historyHash:digest(history),coordinatorState:cursor.coordinatorState,
    mode:'PAUSED',configuration:c,authorizedAt:cursor.authorizedAt,history,warmup:warmupProgress(history,c.startTime),openings:source.currentOpenings()});
}

export function createRuntimeEvidence(g:GenesisInput,state:ExecutionState,cursor:Cursor):RuntimeEvidence {
  const snapshot=reconstructRuntime(g,state,cursor);requireBudget(snapshot,'Runtime configuration required');
  const {version,simulationId,configHash,provider,asOf,phase,confirmedSteps,historyHash,coordinatorState}=snapshot;
  return immutable({version,simulationId,configHash,provider,asOf,phase,confirmedSteps,historyHash,coordinatorState});
}

export function validateRuntimeOperation(g:GenesisInput,state:ExecutionState,p:OperationPayload,cursor:Cursor):void {
  if(!Object.hasOwn(g.configuration,'runtime')){
    requireBudget(!Object.hasOwn(p.evidence,'runtime'),'Legacy D5 has no runtime origin');return;
  }
  requireBudget(same(p.evidence.runtime,createRuntimeEvidence(g,state,cursor)),'Missing/divergent runtime evidence');
}

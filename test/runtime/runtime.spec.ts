import { SimulationRuntime, analyzeBoundary } from '../../src/runtime';
import { RuntimeConfiguration, ENGINE_VERSION } from '../../src/persistence';
import { open, temp, cleanup, raw, rows, configuration as legacyConfiguration, authorizationCommand, payload } from '../persistence/crash-worker';
import { SimulationClock } from '../../src/simulation/clock';
import { SeededGenerator } from '../../src/simulation/seeded-generator';
import { createExecutionState, acceptAuthorizations, processOpening, processClosedCandle } from '../../src/operations';
import { evaluateStrategicExits } from '../../src/runtime/strategic-exits';
import { parseFixed8, formatFixed8 } from '../../src/budget';
import { warmupProgress, createRuntimeEvidence } from '../../src/persistence/runtime-evidence';
import { canonical, GenesisInput, Cursor } from '../../src/persistence';

const start='2026-01-01T00:00:00.000Z';
function config():RuntimeConfiguration {
 const policy=(asset:'BTC'|'ETH')=>({id:`${asset}-P0`,version:'1',asset,state:'UNVALIDATED' as const,families:(['TREND','BREAKOUT','MEAN_REVERSION'] as const).map(family=>({family,id:family,version:'1'}))});
 return {version:'1',simulationId:'runtime',startTime:start,initialCapital:'10000.00000000',provider:{id:'seeded-generator',version:'1',seed:'fixture-1',initialPrices:{BTC:'100.00000000',ETH:'100.00000000'}},policies:{BTC:policy('BTC'),ETH:policy('ETH')},context:{id:'simulated',version:'1',feed:{status:'VALID',events:[]}},warmup:{hourlyCandles:150}};
}
function initial(asOf=start){return {asOf,state:'RUNNING' as const,equity:'10000.00000000',dayOpeningEquity:'10000.00000000',availableCash:'10000.00000000',reservedCash:'0.00000000',committedExposure:{BTC:'0.00000000',ETH:'0.00000000'},committedRisk:'0.00000000',positions:{BTC:'FLAT' as const,ETH:'FLAT' as const},reservations:{BTC:'NONE' as const,ETH:'NONE' as const}};}
afterEach(cleanup);
test('explicit create, start and pause do not advance time; snapshot is immutable JSON',()=>{
 const runtime=new SimulationRuntime(open());const s=runtime.create(config(),{nextTieAsset:'BTC'});
 expect(s.mode).toBe('PAUSED');expect(s.confirmed.control.revision).toBe('0');expect(runtime.start().mode).toBe('WARMING_UP');
 const paused=runtime.pause();expect(paused.confirmed.state.asOf).toBe(start);expect(paused.confirmed.control.revision).toBe('0');expect(Object.isFrozen(paused.confirmed.state)).toBe(true);
 expect(JSON.parse(JSON.stringify(paused))).toEqual(paused);
});
test('one cold cycle confirms empty authorization, opening and closing in causal order',()=>{
 const path=temp(),d=open(path),runtime=new SimulationRuntime(d);runtime.create(config(),{nextTieAsset:'BTC'});runtime.start();const s=runtime.advanceCycle('0');
 expect(s.mode).toBe('WARMING_UP');expect(s.confirmed.control.revision).toBe('3');expect(s.confirmed.state.fills).toEqual([]);
 expect(s.confirmed.state.commands.map(c=>c.kind)).toEqual(['AUTHORIZE','OPEN','CLOSE']);expect(s.confirmed.runtime!.history.BTC).toHaveLength(1);expect(s.confirmed.runtime!.history.ETH).toHaveLength(1);
 expect(s.confirmed.state.asOf).toBe('2026-01-01T00:05:00.000Z');expect(rows(path,'operations')).toHaveLength(4);
});
test('paused and stale attempts have no financial effects',()=>{
 const runtime=new SimulationRuntime(open());runtime.create(config(),{nextTieAsset:'BTC'});expect(()=>runtime.advanceCycle('0')).toThrow();runtime.start();runtime.advanceCycle('0');
 expect(()=>runtime.advanceCycle('0')).toThrow('revision');expect(runtime.snapshot().confirmed.control.revision).toBe('3');runtime.pause();expect(()=>runtime.advanceCycle('3')).toThrow();
});
test.each(['after-operation','after-events','before-commit','after-commit'])('partial recovery after %s does not repeat financial effects',point=>{
 const path=temp();let calls=0,armed=false;const d=open(path,true,p=>{if(armed && p===point && ++calls===2)throw Error('interruption');});
 const runtime=new SimulationRuntime(d);runtime.create(config(),{nextTieAsset:'BTC'});runtime.start();armed=true;expect(()=>runtime.advanceCycle('0')).toThrow();armed=false;
 const before=runtime.snapshot().confirmed;expect(runtime.snapshot().mode).toBe('BLOCKED');runtime.close();
 const next=new SimulationRuntime(open(path,false)),resumed=next.resume('runtime');expect(resumed.mode).toBe('PAUSED');next.start();
 const result=next.advanceCycle(resumed.confirmed.control.revision);expect(result.confirmed.state.commands.map(c=>c.kind)).toEqual(['AUTHORIZE','OPEN','CLOSE']);expect(result.confirmed.state.fills).toHaveLength(0);
 expect(BigInt(result.confirmed.control.revision)).toBeGreaterThanOrEqual(BigInt(before.control.revision));expect(rows(path,'operations')).toHaveLength(4);
});
test('resume after CLOSE continues the next boundary and requires explicit start',()=>{
 const path=temp(),r=new SimulationRuntime(open(path));r.create(config(),{nextTieAsset:'ETH'});r.start();const before=r.advanceCycle('0');r.close();
 const next=new SimulationRuntime(open(path,false));const recovered=next.resume('runtime');expect(recovered.confirmed.state).toEqual(before.confirmed.state);expect(recovered.mode).toBe('PAUSED');
 expect(()=>next.advanceCycle('3')).toThrow();next.start();const s=next.advanceCycle('3');expect(s.confirmed.control.revision).toBe('6');expect(s.confirmed.runtime!.history.BTC).toHaveLength(2);
});
test('missing runtime origin blocks resume rather than inventing generator data',()=>{
 const d=open();d.createSimulation({simulationId:'runtime',operationId:'old',initial:initial(),configuration:{engineVersion:ENGINE_VERSION,coordinatorState:{nextTieAsset:'BTC'},clock:{startTime:start,currentTime:start,steps:0},generator:{seed:'fixture-1',version:'1',confirmedSteps:0}}});
 expect(()=>new SimulationRuntime(d).resume('runtime')).toThrow('runtime');
});
test('invalid explicit creation and lifecycle misuse reject',()=>{
 const r=new SimulationRuntime(open());expect(()=>r.start()).toThrow();expect(()=>r.snapshot()).toThrow();expect(()=>r.create({...config(),initialCapital:'0.00000000'},{nextTieAsset:'BTC'})).toThrow();
 r.create(config(),{nextTieAsset:'BTC'});expect(()=>r.create(config(),{nextTieAsset:'BTC'})).toThrow();r.close();r.close();expect(()=>r.start()).toThrow();
});
test('real analytical chain qualifies without modified scores; D2 order and D3 quotes are retained',()=>{
 const c=config(),clock=new SimulationClock(start),source=new SeededGenerator(clock,c.provider),history:{BTC:any[];ETH:any[]}={BTC:[],ETH:[]};
 for(let i=0;i<1804;i++)for(const candle of source.next())history[candle.asset].push(candle);
 const asOf=clock.snapshot().currentTime;
 const event=(group:string,category:'CRYPTO'|'MACRO',sequence:number)=>({eventId:group,groupId:group,revision:1,previousEventId:null,source:'simulation',publishedAt:asOf,availableAt:asOf,sequence,category,state:'CONFIRMED' as const,impacts:{BTC:{direction:1 as const,intensity:30 as const},ETH:{direction:1 as const,intensity:30 as const}}});
 const ready={...c,context:{...c.context,feed:{status:'VALID' as const,events:[event('a','CRYPTO',1),event('b','MACRO',2)]}}};
 expect(warmupProgress(history,start).ready).toBe(true);
 const analysis=analyzeBoundary(createExecutionState(initial(asOf)),history,ready,{nextTieAsset:'BTC'},true);
 expect(analysis.decisions.map(d=>d.asset)).toEqual(['BTC','ETH']);expect(analysis.coordination.opportunities.some(d=>d.candidate?.scoreRounded===75 && d.asset==='ETH')).toBe(true);
 expect(analysis.authorization.decisions.map(d=>d.decisionId)).toEqual(analysis.coordination.opportunities.map(d=>d.id));
 expect(analysis.authorization.decisions.some(d=>d.status==='AUTHORIZED')).toBe(true);
 let execution=processOpening(acceptAuthorizations(createExecutionState(initial(asOf)),analysis.authorization),source.currentOpenings(),[],asOf);
 const entry=execution.positions.find(p=>p.asset==='ETH')!;expect(entry.status).toBe('OPEN');expect(entry.strategyId).toBe('BREAKOUT');
 const level=history.ETH.slice(-21,-1).reduce((max,c)=>parseFixed8(c.high)>max?parseFixed8(c.high):max,0n);
 const low=formatFixed8(level-1n);
 for(let i=0;i<2;i++){
   const at=execution.asOf,end=new Date(Date.parse(at)+300000).toISOString();
   if(execution.phase==='BEFORE_OPEN')execution=processOpening(execution,(['BTC','ETH'] as const).map(asset=>({asset,asOf:at,price:history[asset].at(-1)!.close})),[],at);
   const candles=(['BTC','ETH'] as const).map(asset=>{const price=execution.openingPrices[asset]!,close=asset==='ETH'?low:price;
     return {asset,openTime:at,closeTime:end,open:price,close,high:parseFixed8(price)>parseFixed8(close)?price:close,low:parseFixed8(price)<parseFixed8(close)?price:close,volume:'100.00000000'};});
   execution=processClosedCandle(execution,candles,end);for(const c of candles)history[c.asset].push(c);
   const exits=evaluateStrategicExits(execution,history,end);expect(exits).toHaveLength(i===0?0:1);
   if(i===1){const opens=(['BTC','ETH'] as const).map(asset=>({asset,asOf:end,price:asset==='ETH'?formatFixed8(BigInt(entry.stop.numerator)/BigInt(entry.stop.denominator)-1n):history.BTC.at(-1)!.close}));
     const protectedState=processOpening(execution,opens,exits,end);expect(protectedState.fills.at(-1)!.reason).toBe('STOP');
     expect(processOpening(protectedState,opens,exits,end)).toEqual(protectedState);expect(protectedState.fills.filter(f=>f.asset==='ETH' && f.side==='BUY')).toHaveLength(1);
   }
 }
 const originalHistory={BTC:history.BTC.slice(0,1804),ETH:history.ETH.slice(0,1804)};
 const unavailable=analyzeBoundary(createExecutionState(initial(asOf)),originalHistory,{...ready,context:{...ready.context,feed:{status:'INVALID',events:[]}}},{nextTieAsset:'BTC'},true);
 expect(unavailable.coordination.opportunities).toEqual([]);
 const warming=analyzeBoundary(createExecutionState(initial(asOf)),originalHistory,ready,{nextTieAsset:'BTC'},false);expect(warming.coordination.opportunities).toEqual([]);
 const future=new Date(Date.parse(asOf)+300000).toISOString();
 const hidden={...ready,context:{...ready.context,feed:{status:'VALID' as const,events:ready.context.feed.events.map(e=>({...e,publishedAt:future,availableAt:future}))}}};
 const withoutFuture=analyzeBoundary(createExecutionState(initial(asOf)),originalHistory,{...ready,context:{...ready.context,feed:{status:'VALID',events:[]}}},{nextTieAsset:'BTC'},true);
 expect(analyzeBoundary(createExecutionState(initial(asOf)),originalHistory,hidden,{nextTieAsset:'BTC'},true)).toEqual(withoutFuture);
},20000);
test('deterministic independent runs preserve confirmed JSON and each asset stream',()=>{
 const a=new SimulationRuntime(open()),b=new SimulationRuntime(open());a.create(config(),{nextTieAsset:'BTC'});b.create(config(),{nextTieAsset:'BTC'});a.start();b.start();
 expect(a.advanceCycle('0')).toEqual(b.advanceCycle('0'));expect(a.advanceCycle('3')).toEqual(b.advanceCycle('3'));
});
test('corrupt persisted history blocks processing without publishing speculative state',()=>{
 const path=temp(),r=new SimulationRuntime(open(path));r.create(config(),{nextTieAsset:'BTC'});r.start();const before=r.advanceCycle('0');
 raw(path,db=>db.exec("DROP TRIGGER events_update;UPDATE events SET hash='bad' WHERE seq=1"));
 expect(()=>r.advanceCycle('3')).toThrow();expect(r.snapshot().mode).toBe('BLOCKED');expect(r.snapshot().confirmed.state).toEqual(before.confirmed.state);expect(()=>r.start()).toThrow();
});
// Negative legacy fixtures: deliberately authorized before warmup by the older public gateway.
// They must never be treated as valid RUNTIME-002 trading or strategic evidence.
test.each(['AUTHORIZED','OPEN'])('legacy %s without required history cannot bypass runtime gates',stage=>{
 const d=open(),c={...config(),startTime:legacyConfiguration.clock.startTime,provider:{...config().provider,seed:legacyConfiguration.generator.seed}},g:GenesisInput={simulationId:'runtime',operationId:'legacy-origin',initial:initial(c.startTime),configuration:{...legacyConfiguration,runtime:c}};
 d.createSimulation(g);const auth=authorizationCommand();if(auth.kind!=='AUTHORIZE')throw Error('Invalid legacy fixture');
 let before=d.loadState('runtime'),state=acceptAuthorizations(before.state,auth.authorization),b=JSON.parse(payload(auth));
 let cursor:Cursor={...before.control.cursor,authorizedAt:c.startTime,coordinatorState:b.evidence.coordinator.nextState};b.evidence.runtime=createRuntimeEvidence(g,state,cursor);
 d.commitOperation({simulationId:'runtime',operationId:'legacy-auth',expectedRevision:'0',payload:canonical(b)});
 if(stage==='OPEN'){
   before=d.loadState('runtime');const source=new SeededGenerator(new SimulationClock(c.startTime),c.provider),op={id:JSON.stringify(['OPEN',c.startTime]),kind:'OPEN' as const,asOf:c.startTime,openings:source.currentOpenings(),exits:[]};
   state=processOpening(before.state,op.openings,[],op.asOf);b=JSON.parse(payload(op));cursor={...before.control.cursor,phase:'AFTER_OPEN'};
   b.evidence.runtime=createRuntimeEvidence(g,state,cursor);d.commitOperation({simulationId:'runtime',operationId:'legacy-open',expectedRevision:'1',payload:canonical(b)});
 }
 const runtime=new SimulationRuntime(d);
 if(stage==='AUTHORIZED'){runtime.resume('runtime');runtime.start();expect(()=>runtime.advanceCycle('1')).toThrow('Warmup incomplete');expect(runtime.snapshot().confirmed.state.reservations.every(r=>r.status==='ACTIVE')).toBe(true);}
 else {expect(()=>runtime.resume('runtime')).toThrow('origin history absent');expect(runtime.snapshot().confirmed.state.fills).toHaveLength(2);}
 expect(runtime.snapshot().mode).toBe('BLOCKED');expect(runtime.snapshot().confirmed.control.status).toBe('ENTRY_SUSPENDED');
 if(stage==='AUTHORIZED'){
   const recovered=runtime.resume('runtime');runtime.start();const released=runtime.advanceCycle(recovered.confirmed.control.revision);
   expect(released.confirmed.state.commands.filter(c=>c.kind==='CANCEL')).toHaveLength(2);expect(released.confirmed.state.fills).toEqual([]);
   expect(released.confirmed.state.availableCash).toBe('10000.00000000');
 }
});
test('a competing confirmed phase interrupts the cycle at its receipt instead of advancing another boundary',()=>{
 const d=open(),c=config(),r=new SimulationRuntime(d);r.create(c,{nextTieAsset:'BTC'});r.start();
 const originalCommit=d.commitOperationWithSnapshot.bind(d);let interleaved=false;
 const spy=jest.spyOn(d,'commitOperationWithSnapshot').mockImplementation(input=>{
   const result=originalCommit(input),loaded=result.snapshot!;
   if(!interleaved && result.revision==='1'){
     interleaved=true;const source=new SeededGenerator(new SimulationClock(c.startTime),c.provider),command={id:JSON.stringify(['OPEN',c.startTime]),kind:'OPEN' as const,asOf:c.startTime,openings:source.currentOpenings(),exits:[]};
     const next=processOpening(loaded.state,command.openings,[],command.asOf),cursor={...loaded.control.cursor,phase:'AFTER_OPEN' as const};
     const g:GenesisInput={simulationId:c.simulationId,operationId:'runtime-genesis',initial:initial(),configuration:{engineVersion:ENGINE_VERSION,coordinatorState:{nextTieAsset:'BTC'},clock:{startTime:c.startTime,currentTime:c.startTime,steps:0},generator:{version:'1',seed:c.provider.seed,confirmedSteps:0},runtime:c}};
     d.commitOperation({simulationId:c.simulationId,operationId:'competing-open',expectedRevision:'1',payload:canonical({command,evidence:{coordinator:null,clock:cursor.clock,generator:cursor.generator,runtime:createRuntimeEvidence(g,next,cursor)}})});
     expect(result.revision).toBe('1');expect(result.snapshot!.control.revision).toBe('1');
     expect(d.loadState(c.simulationId).control.revision).toBe('2');
   }
   return result;
 });
 try{expect(()=>r.advanceCycle('0')).toThrow('CONFLICT: obsolete expected revision');expect(interleaved).toBe(true);expect(r.snapshot().confirmed.state.phase).toBe('AFTER_OPEN');expect(r.snapshot().confirmed.control.revision).toBe('2');}
 finally{spy.mockRestore();}
 const restored=r.resume(c.simulationId);r.start();expect(r.advanceCycle(restored.confirmed.control.revision).confirmed.state.commands.map(c=>c.kind)).toEqual(['AUTHORIZE','OPEN','CLOSE']);
});


test('an old replay receipt cannot be relabeled with a newer concurrent head',()=>{
 const d=open(),c=config(),r=new SimulationRuntime(d);r.create(c,{nextTieAsset:'BTC'});r.start();
 const original=d.commitOperationWithSnapshot.bind(d);let advanced=false,missing=false;
 const spy=jest.spyOn(d,'commitOperationWithSnapshot').mockImplementation(input=>{
   const result=original(input);
   if(!advanced && result.revision==='1'){
     advanced=true;const competing=new SimulationRuntime(d),resumed=competing.resume(c.simulationId);competing.start();
     expect(competing.advanceCycle(resumed.confirmed.control.revision).confirmed.control.revision).toBe('3');
     expect(result.snapshot!.control.revision).toBe('1');
   }else if(result.disposition==='REPLAY'){
     missing=true;expect(result.revision).toBe('2');expect(result.snapshot).toBeNull();
   }
   return result;
 });
 try{expect(()=>r.advanceCycle('0')).toThrow('Concurrent runtime advancement beyond confirmed receipt');expect(advanced && missing).toBe(true);
   const recovered=r.snapshot();expect(recovered.mode).toBe('BLOCKED');expect(recovered.confirmed.control.revision).toBe('3');
   expect(recovered.confirmed.state.commands.map(c=>c.kind)).toEqual(['AUTHORIZE','OPEN','CLOSE']);expect(recovered.confirmed.state.fills).toEqual([]);
 }finally{spy.mockRestore();}
});

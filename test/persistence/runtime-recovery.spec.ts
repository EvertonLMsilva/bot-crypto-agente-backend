import { DurableExecution, canonical } from '../../src/persistence';
import { RuntimeConfiguration, RuntimeEvidence } from '../../src/persistence/types';
import { validateRuntimeConfiguration, createRuntimeEvidence, warmupProgress } from '../../src/persistence/runtime-evidence';
import { SimulationClock } from '../../src/simulation/clock';
import { SeededGenerator } from '../../src/simulation/seeded-generator';
import { Candle } from '../../src/simulation/candle';
import { ExecutionCommand, acceptAuthorizations, processOpening, processClosedCandle } from '../../src/operations';
import { open, temp, cleanup, configuration, portfolio, authorizationCommand, payload, raw, rows, genesis } from './crash-worker';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

afterEach(cleanup);
const start = configuration.clock.startTime;
function config(): RuntimeConfiguration {
  const policy=(asset:'BTC'|'ETH')=>({id:`${asset}-P0`,asset,version:'1',state:'UNVALIDATED' as const,
    families:(['TREND','BREAKOUT','MEAN_REVERSION'] as const).map(family=>({family,id:family,version:'1'}))});
  return { version: '1', simulationId: 'sim', startTime: start, initialCapital: '10000.00000000',
    provider: { id: 'seeded-generator', version: '1', seed: configuration.generator.seed, initialPrices: { BTC: '100.00000000', ETH: '100.00000000' } },
    policies: {BTC:policy('BTC'),ETH:policy('ETH')},
    context: { id: 'simulated-context', version: '1', feed: {status:'VALID',events:[]} }, warmup: { hourlyCandles:150 } };
}
function setup(path=temp(),fault?:(point:string)=>void) {
  const d=open(path,true,fault),g={simulationId:'sim',operationId:'genesis',initial:portfolio(),configuration:{...configuration,runtime:config()}};
  d.createSimulation(g);return {d,g,path,source:new SeededGenerator(new SimulationClock(start),config().provider)};
}
function send(d:DurableExecution,g:ReturnType<typeof setup>['g'],command:ExecutionCommand,id:string,revision:string) {
  const loaded=d.loadState('sim');
  const state=command.kind==='AUTHORIZE'?acceptAuthorizations(loaded.state,command.authorization):command.kind==='OPEN'?processOpening(loaded.state,command.openings,command.exits,command.asOf)
    :command.kind==='CLOSE'?processClosedCandle(loaded.state,command.candles,command.asOf):loaded.state;
  const base=JSON.parse(payload(command));
  const cursor={...loaded.control.cursor,asOf:state.asOf,phase:state.phase,clock:base.evidence.clock,generator:base.evidence.generator,
    coordinatorState:base.evidence.coordinator?.nextState??loaded.control.cursor.coordinatorState,
    authorizedAt:command.kind==='AUTHORIZE'?state.asOf:command.kind==='CLOSE'?null:loaded.control.cursor.authorizedAt};
  base.evidence.runtime=createRuntimeEvidence(g,state,cursor);
  return d.commitOperation({simulationId:'sim',operationId:id,expectedRevision:revision,payload:canonical(base)});
}
function authorize(s:ReturnType<typeof setup>) {return send(s.d,s.g,authorizationCommand(),'authorize','0');}
function opening(s:ReturnType<typeof setup>) {return {id:JSON.stringify(['OPEN',start]),kind:'OPEN' as const,asOf:start,openings:s.source.currentOpenings(),exits:[]};}
function close(s:ReturnType<typeof setup>) {const candles=s.source.next(),asOf=candles[0].closeTime;return {id:JSON.stringify(['CLOSE',asOf]),kind:'CLOSE' as const,asOf,candles};}

test('explicit configuration is canonical, copied, immutable and reproducible',()=>{
 const input=config(),validated=validateRuntimeConfiguration(input);
 expect(validated).toEqual(input);expect(Object.isFrozen(validated.provider.initialPrices)).toBe(true);
 expect(canonical(validated)).toBe(canonical(validateRuntimeConfiguration(JSON.parse(canonical(input)))));
 expect(()=>Object.assign(validated.provider.initialPrices,{BTC:'1.00000000'})).toThrow();
});
test.each(['missing','version','seed','price','policy','context','warmup','identity','time','capital'])('rejects invalid runtime configuration: %s',kind=>{
 const c:any=config();if(kind==='missing')delete c.provider;else if(kind==='version')c.provider.version='2';else if(kind==='seed')c.provider.seed='';else if(kind==='price')c.provider.initialPrices.BTC='0.00000000';
 else if(kind==='policy')c.policies.ETH.asset='BTC';else if(kind==='context')delete c.context.feed;else if(kind==='warmup')c.warmup.hourlyCandles=149;else if(kind==='identity')c.simulationId='';else if(kind==='time')c.startTime='2026-01-01';else c.initialCapital='0.00000000';
 expect(()=>validateRuntimeConfiguration(c)).toThrow(RangeError);
});
test('new genesis validates configuration against original D5 financial and clock origins',()=>{
 const d=open();for(const patch of [{simulationId:'different'},{startTime:'2026-01-01T02:00:00.000Z'},{initialCapital:'1.00000000'},
 {provider:{...config().provider,seed:'different'}}])expect(()=>d.createSimulation({simulationId:'sim',operationId:'g',initial:portfolio(),configuration:{...configuration,runtime:{...config(),...patch}}})).toThrow();
});
test('recovery after authorization retains holds, no reauthorization and a PAUSED runtime snapshot',()=>{
 const s=setup();const r=authorize(s),before=s.d.loadState('sim');s.d.close();const n=open(s.path,false),after=n.recover('sim');
 expect(after.state).toEqual(before.state);expect(after.runtime?.mode).toBe('PAUSED');expect(after.runtime?.authorizedAt).toBe(start);
 expect(after.runtime?.warmup.ready).toBe(false);expect(after.runtime?.configuration.provider.initialPrices).toEqual(config().provider.initialPrices);
 expect(n.commitOperation({simulationId:'sim',operationId:'authorize',expectedRevision:'0',payload:String(rows(s.path,'operations')[1]!.payload)})).toEqual(r);
});
test('recovery AFTER_OPEN preserves fills and consumes only the unconfirmed close',()=>{
 const s=setup();authorize(s);send(s.d,s.g,opening(s),'open','1');const before=s.d.loadState('sim');s.d.close();const n=open(s.path,false);
 const after=n.recover('sim');expect(after.state).toEqual(before.state);expect(after.runtime?.phase).toBe('AFTER_OPEN');expect(after.runtime?.history.BTC).toEqual([]);
 send(n,s.g,close(s),'close','2');const recovered=n.recover('sim');expect(recovered.state.fills).toHaveLength(2);expect(recovered.runtime?.history.BTC).toHaveLength(1);
 expect(recovered.runtime?.openings.map(o=>o.price)).toEqual(s.source.currentOpenings().map(o=>o.price));
});
test('actual new process reconstructs confirmed closes and returns only PAUSED immutable data',()=>{
 const s=setup();authorize(s);send(s.d,s.g,opening(s),'open','1');send(s.d,s.g,close(s),'close','2');const expected=s.d.recover('sim').runtime;s.d.close();
 const entry=resolve('src/persistence/index.ts');
 const script=`const fs=require('fs'),ts=require('typescript');require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,p);const {DurableExecution}=require(${JSON.stringify(entry)});const d=new DurableExecution(${JSON.stringify(s.path)},{create:false,busyTimeoutMs:2000});console.log(JSON.stringify(d.recover('sim').runtime));d.close();`;
 const child=spawnSync(process.execPath,['-e',script],{encoding:'utf8',timeout:20000,windowsHide:true});expect(child.status).toBe(0);expect(JSON.parse(child.stdout)).toEqual(expected);
 expect(Object.isFrozen(expected?.history.BTC)).toBe(true);expect(canonical(expected)).toBe(canonical(JSON.parse(child.stdout)));
});
test.each(['absent','version','configHash','phase','historyHash','provider','simulation','steps','coordinator'])('divergent runtime evidence %s blocks new financial processing',kind=>{
 const s=setup();const cmd=authorizationCommand();if(cmd.kind!=='AUTHORIZE')throw Error('Invalid fixture');
 const state=acceptAuthorizations(s.d.loadState('sim').state,cmd.authorization);
 const b=JSON.parse(payload(cmd)),cursor={...s.d.loadState('sim').control.cursor,authorizedAt:start,coordinatorState:b.evidence.coordinator.nextState};
 const e:any=createRuntimeEvidence(s.g,state,cursor);const changed={...e};
 if(kind==='absent')delete b.evidence.runtime;else {if(kind==='version')changed.version='2';else if(kind==='phase')changed.phase='AFTER_OPEN';else if(kind==='simulation')changed.simulationId='other';else if(kind==='steps')changed.confirmedSteps=1;else if(kind==='coordinator')changed.coordinatorState={nextTieAsset:'BTC'};else changed[kind]='bad';b.evidence.runtime=changed;}
 expect(()=>s.d.commitOperation({simulationId:'sim',operationId:'bad',expectedRevision:'0',payload:canonical(b)})).toThrow();
 expect(rows(s.path,'operations')).toHaveLength(1);expect(JSON.parse(String(rows(s.path,'runtime_control').at(-1)!.payload)).status).toBe('MANUAL_REVIEW_REQUIRED');
});
test('candle divergence is rejected without recording a close or manufacturing prices',()=>{
 const s=setup();authorize(s);send(s.d,s.g,opening(s),'open','1');const c=close(s),bad={...c,candles:c.candles.map(v=>({...v,volume:'2.00000000'}))};
 const b=JSON.parse(payload(bad));b.evidence.runtime={} as RuntimeEvidence;
 expect(()=>s.d.commitOperation({simulationId:'sim',operationId:'bad-close',expectedRevision:'2',payload:canonical(b)})).toThrow();expect(rows(s.path,'operations')).toHaveLength(3);
});
test('legacy D5 remains recoverable and does not gain invented runtime evidence',()=>{
 const d=open();genesis(d);expect(d.recover('sim').runtime).toBeUndefined();expect(Object.keys(d.loadState('sim'))).toEqual(['control','state']);
 const b=JSON.parse(payload(authorizationCommand()));b.evidence.runtime={version:'1'};
 expect(()=>d.commitOperation({simulationId:'sim',operationId:'bad',expectedRevision:'0',payload:canonical(b)})).toThrow();
});
function history(count:number,startTime=start):Candle[] {const source=new SeededGenerator(new SimulationClock(startTime),config().provider);return Array.from({length:count},()=>source.next()[0]);}
test('150 complete hours is exact; BTC/ETH progress is independent and insufficient history remains unavailable',()=>{
 const btc=history(1800),eth=btc.map(c=>({...c,asset:'ETH' as const}));
 const before=warmupProgress({BTC:btc.slice(0,1799),ETH:eth},start);expect(before.BTC.completeHours).toBe(149);expect(before.ETH.completeHours).toBe(150);expect(before.ready).toBe(false);
 const exact=warmupProgress({BTC:btc,ETH:eth},start);expect(exact.ready).toBe(true);expect(Object.isFrozen(exact.BTC)).toBe(true);
});
test('misaligned start waits for complete aligned hourly groups',()=>{
 const at='2026-01-01T01:05:00.000Z',btc=history(1811,at),eth=btc.map(c=>({...c,asset:'ETH' as const}));
 expect(warmupProgress({BTC:btc.slice(0,1800),ETH:eth.slice(0,1800)},at).ready).toBe(false);
 expect(warmupProgress({BTC:btc,ETH:eth},at).ready).toBe(true);
});
test('warmup rejects gaps, mixed assets, invalid OHLC and out of order history',()=>{
 const btc=history(15);for(const bad of [btc.slice(1),[...btc].reverse(),btc.map(c=>({...c,asset:'ETH' as const})),btc.map(c=>({...c,low:'200.00000000'}))])
 expect(()=>warmupProgress({BTC:bad,ETH:[]},start)).toThrow();
});
test('nondefault seed and initial BTC/ETH prices survive immutable genesis recovery',()=>{
 const d=open(),c=config(),provider={...c.provider,seed:'explicit-seed',initialPrices:{BTC:'123.00000001',ETH:'456.00000002'}};
 d.createSimulation({simulationId:'sim',operationId:'genesis',initial:portfolio(),configuration:{...configuration,generator:{...configuration.generator,seed:provider.seed},runtime:{...c,provider}}});
 const s=d.recover('sim');expect(s.runtime?.configuration.provider).toEqual(provider);expect(s.runtime?.openings.map(v=>v.price)).toEqual(Object.values(provider.initialPrices));
});
test('incompatible persisted provider version is diagnosed before recovery enables entries',()=>{
 const s=setup();s.d.close();raw(s.path,db=>{
   db.exec('DROP TRIGGER simulations_update');const row=db.prepare('SELECT genesis FROM simulations').get()!;
   const g=JSON.parse(String(row.genesis));g.configuration.runtime.provider.version='future';
   const digest=require('node:crypto').createHash('sha256').update(canonical(g)).digest('hex');
   db.prepare('UPDATE simulations SET genesis=?,genesis_hash=?').run(canonical(g),digest);
 });
 const d=open(s.path,false);expect(()=>d.recover('sim')).toThrow('Unsupported runtime provider');expect(()=>d.loadState('sim')).toThrow('locally blocked');
 expect(JSON.parse(String(rows(s.path,'runtime_control').at(-1)!.payload)).status).toBe('MANUAL_REVIEW_REQUIRED');
});
test('altered stored runtime evidence fails replay even with its payload hash recomputed',()=>{
 const s=setup();authorize(s);raw(s.path,db=>{
   db.exec('DROP TRIGGER operations_update');const row=db.prepare('SELECT payload FROM operations WHERE revision=1').get()!;
   const p=JSON.parse(String(row.payload));p.evidence.runtime.historyHash='corrupted';
   const digest=require('node:crypto').createHash('sha256').update(canonical(p)).digest('hex');
   db.prepare('UPDATE operations SET payload=?,payload_hash=? WHERE revision=1').run(canonical(p),digest);
 });
 expect(()=>s.d.recover('sim')).toThrow('runtime evidence');expect(rows(s.path,'operations')).toHaveLength(2);
});
test('incomplete config cannot be retrofitted into a legacy genesis',()=>{
 const d=open();expect(()=>d.createSimulation({simulationId:'sim',operationId:'genesis',initial:portfolio(),configuration:{...configuration,runtime:null as unknown as RuntimeConfiguration}})).toThrow();
});
test('malformed context and duplicated policy family are rejected; explicit unavailable feed stays unavailable',()=>{
 const c=config();expect(()=>validateRuntimeConfiguration({...c,context:{...c.context,feed:{status:'VALID',events:[{} as never]}}})).toThrow();
 const btc=c.policies.BTC;expect(()=>validateRuntimeConfiguration({...c,policies:{...c.policies,BTC:{...btc,families:[btc.families[0]!,btc.families[0]!,btc.families[2]!]}}})).toThrow();
 expect(validateRuntimeConfiguration({...c,context:{...c.context,feed:{status:'INVALID',events:[]}}}).context.feed.status).toBe('INVALID');
});
test('source rejects skipped openings and impossible cursor phases rather than filling missing bars',()=>{
 const s=setup();const loaded=s.d.loadState('sim'),c=loaded.control.cursor;
 expect(()=>createRuntimeEvidence(s.g,loaded.state,{...c,phase:'AFTER_OPEN'})).toThrow('cursor/phase');
 const time='2026-01-01T01:05:00.000Z',command={...opening(s),id:JSON.stringify(['OPEN',time]),asOf:time,openings:s.source.currentOpenings().map(o=>({...o,asOf:time}))};
 const b=JSON.parse(payload(command));b.evidence.runtime={};
 expect(()=>s.d.commitOperation({simulationId:'sim',operationId:'skipped',expectedRevision:'0',payload:canonical(b)})).toThrow('opening differs');
 expect(rows(s.path,'operations')).toHaveLength(1);
});
test('failed CLOSE persistence preserves the confirmed generator boundary and exact retry',()=>{
 let armed=false;const s=setup(undefined,p=>{if(armed && p==='after-events')throw Error('write failure');});
 authorize(s);send(s.d,s.g,opening(s),'open','1');const before=s.d.loadState('sim'),command=close(s);armed=true;
 expect(()=>send(s.d,s.g,command,'close','2')).toThrow('write failure');armed=false;
 const restored=s.d.recover('sim');expect(restored.runtime).toEqual(before.runtime);expect(restored.state).toEqual(before.state);
 const r=send(s.d,s.g,command,'close','2');expect(r.revision).toBe('3');expect(s.d.loadState('sim').runtime?.history.BTC).toHaveLength(1);
 expect(s.d.loadState('sim').state.fills).toHaveLength(2);
});

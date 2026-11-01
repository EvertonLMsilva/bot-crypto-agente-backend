import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { SimulationRuntime } from '../../src/runtime';
import { RuntimeConfiguration, canonical, GenesisInput, OperationPayload } from '../../src/persistence';
import { analyzeBoundary } from '../../src/runtime/runtime';
import { createRuntimeEvidence } from '../../src/persistence/runtime-evidence';
import { execute, advanceCursor } from '../../src/persistence/ledger';
import { createExecutionState, ExecutionCommand } from '../../src/operations';
import { SimulationClock } from '../../src/simulation/clock';
import { SeededGenerator } from '../../src/simulation/seeded-generator';
import { Asset, Candle } from '../../src/simulation/candle';
import { FixtureProvider } from '../../src/simulation/market-source';
import { fixtureManifestHash } from '../../src/simulation/fixture-source';
import { CandleBatch } from '../../src/simulation/seeded-generator';
import { createHash } from 'node:crypto';
import { open, temp, cleanup, raw, rows, genesis, configuration, portfolio } from './crash-worker';

const start=configuration.clock.startTime;
function config():RuntimeConfiguration {
 const policy=(asset:'BTC'|'ETH')=>({id:`${asset}-P0`,asset,version:'1',state:'UNVALIDATED' as const,families:(['TREND','BREAKOUT','MEAN_REVERSION'] as const).map(family=>({family,id:family,version:'1'}))});
 const batches=Array.from({length:2},(_,i)=>(['BTC','ETH'] as const).map(asset=>({asset,openTime:new Date(Date.parse(start)+i*300000).toISOString(),closeTime:new Date(Date.parse(start)+(i+1)*300000).toISOString(),open:i===0?'100.00000000':'80.00000000',high:i===0?'102.00000000':'85.00000000',low:i===0?'99.00000000':'79.00000000',close:i===0?'101.00000000':'81.00000000',volume:'1.00000000'})) as unknown as CandleBatch);
 const body={version:'1' as const,id:'recovery-fixture',startTime:start,batches},hash=fixtureManifestHash(body),identity='fixture-market/1:'+hash;
 return {version:'2',simulationId:'sim',startTime:start,initialCapital:'10000.00000000',provider:{id:'fixture-market',version:'1',identity,seed:identity,initialPrices:{BTC:'100.00000000',ETH:'100.00000000'},manifest:{...body,hash}},
  policies:{BTC:policy('BTC'),ETH:policy('ETH')},context:{id:'context',version:'1',feed:{status:'VALID',events:[]}},warmup:{hourlyCandles:150}};
}
afterEach(cleanup);
test('fixture config and evidence are persisted, gaps reproduced and valid EOF pauses without new AUTHORIZE',()=>{
 const path=temp(),d=open(path),r=new SimulationRuntime(d),c=config();r.create(c,{nextTieAsset:'BTC'});r.start();const first=r.advanceCycle('0');
 expect(first.confirmed.runtime!.version).toBe('2');expect(first.confirmed.runtime!.history.BTC[0]!.close).toBe('101.00000000');
 expect(first.confirmed.runtime!.openings[0]!.price).toBe('80.00000000');const last=r.advanceCycle('3');
 expect(last.mode).toBe('PAUSED');expect(last.confirmed.runtime!.version==='2' && last.confirmed.runtime!.exhausted).toBe(true);
 expect(last.confirmed.runtime!.openings).toEqual([]);expect(last.confirmed.state.fills).toEqual([]);
 const count=rows(path,'operations').length,control=last.confirmed.control;expect(r.start().mode).toBe('PAUSED');
 expect(()=>r.advanceCycle(control.revision)).toThrow();expect(rows(path,'operations')).toHaveLength(count);expect(r.snapshot().confirmed.control).toEqual(control);
 expect(JSON.parse(String(rows(path,'operations')[0]!.payload)).configuration.runtime).toEqual(c);
 expect(JSON.parse(String(rows(path,'operations')[1]!.payload)).evidence.runtime.provider.manifestHash).toBe((c.provider as FixtureProvider).manifest.hash);
 expect(d.recover('sim').control.status).toBe('RUNNING');
});
test('fixture resumes PAUSED in a real new process, including valid exhausted boundary',()=>{
 const path=temp(),r=new SimulationRuntime(open(path));r.create(config(),{nextTieAsset:'ETH'});r.start();r.advanceCycle('0');const expected=r.advanceCycle('3');r.close();
 const entry=resolve('src/persistence/index.ts'),runtime=resolve('src/runtime/index.ts');
 const script=`const fs=require('fs'),ts=require('typescript');require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,p);const {DurableExecution}=require(${JSON.stringify(entry)}),{SimulationRuntime}=require(${JSON.stringify(runtime)});const r=new SimulationRuntime(new DurableExecution(${JSON.stringify(path)},{create:false,busyTimeoutMs:2000}));console.log(JSON.stringify(r.resume('sim')));r.close();`;
 const child=spawnSync(process.execPath,['-e',script],{encoding:'utf8',timeout:20000,windowsHide:true});expect(child.status).toBe(0);
 const restored=JSON.parse(child.stdout);expect(restored.mode).toBe('PAUSED');expect(restored.confirmed.state).toEqual(expected.confirmed.state);expect(restored.confirmed.runtime).toEqual(expected.confirmed.runtime);
});
test('durable replay is exact; changing a persisted simulation manifest is not a legal future update',()=>{
 const path=temp(),d=open(path),r=new SimulationRuntime(d);r.create(config(),{nextTieAsset:'BTC'});r.start();r.advanceCycle('0');
 const row=rows(path,'operations')[1]!,receipt=d.commitOperation({simulationId:'sim',operationId:String(row.operation_id),expectedRevision:'0',payload:String(row.payload)});
 expect(canonical(receipt)).toBe(String(row.receipt));expect(rows(path,'operations')).toHaveLength(4);
 const changed:any=structuredClone(config());changed.provider.manifest.batches[1][0].close='82.00000000';changed.provider.manifest.hash=fixtureManifestHash(changed.provider.manifest);
 changed.provider.identity=changed.provider.seed='fixture-market/1:'+changed.provider.manifest.hash;
 expect(()=>d.createSimulation({simulationId:'sim',operationId:'runtime-genesis',initial:portfolio(),configuration:{...configuration,runtime:changed,generator:{version:'1',seed:changed.provider.identity,confirmedSteps:0}}})).toThrow('Divergent simulation genesis');
 expect(rows(path,'operations')).toHaveLength(4);
});
test.each(['manifest','opening','evidence'])('divergent %s fails closed with financial rows preserved',kind=>{
 const path=temp(),d=open(path),r=new SimulationRuntime(d);r.create(config(),{nextTieAsset:'BTC'});r.start();r.advanceCycle('0');const before=rows(path,'operations').length;
 raw(path,db=>{
   if(kind==='manifest'){
    db.exec('DROP TRIGGER simulations_update');const g=JSON.parse(String(db.prepare('SELECT genesis FROM simulations').get()!.genesis));g.configuration.runtime.provider.manifest.batches[1][0].open='79.00000000';db.prepare('UPDATE simulations SET genesis=?,genesis_hash=?').run(canonical(g),createHash('sha256').update(canonical(g)).digest('hex'));
   }else {
    db.exec('DROP TRIGGER operations_update');const row=db.prepare('SELECT payload FROM operations WHERE revision=?').get(kind==='opening'?2:1)!;const p=JSON.parse(String(row.payload));
    if(kind==='opening')p.command.openings[0].price='99.00000000';else p.evidence.runtime.provider.manifestHash='bad';
    db.prepare('UPDATE operations SET payload=?,payload_hash=? WHERE revision=?').run(canonical(p),createHash('sha256').update(canonical(p)).digest('hex'),kind==='opening'?2:1);
   }
 });
 expect(()=>r.resume('sim')).toThrow();expect(rows(path,'operations')).toHaveLength(before);expect(()=>d.loadState('sim')).toThrow();
});
test('runtime1 receipts and snapshots do not gain version2 fields; legacy D5 stays financial-only',()=>{
 const old=open();genesis(old);expect(old.recover('sim').runtime).toBeUndefined();
 const c=config(),seeded:RuntimeConfiguration={...c,version:'1',provider:{id:'seeded-generator',version:'1',seed:'old',initialPrices:{BTC:'100.00000000',ETH:'100.00000000'}}};
 const r=new SimulationRuntime(open());r.create(seeded,{nextTieAsset:'BTC'});r.start();const rt=r.advanceCycle('0').confirmed.runtime!;
 expect(rt.version).toBe('1');expect(Object.hasOwn(rt,'exhausted')).toBe(false);expect(Object.keys(rt.provider).sort()).toEqual(['id','version']);
});

test.each(['version','origin','identity'])('invalid fixture configuration %s creates no simulation',kind=>{
 const path=temp(),d=open(path),c:any=structuredClone(config());
 if(kind==='version')c.version='1';else if(kind==='origin')c.startTime='2026-01-01T02:00:00.000Z';else c.provider.identity='changed';
 expect(()=>new SimulationRuntime(d).create(c,{nextTieAsset:'BTC'})).toThrow();expect(rows(path,'simulations')).toEqual([]);expect(rows(path,'operations')).toEqual([]);
});

test('public D5 commit cannot confirm an AUTHORIZE beyond the fixture even with an empty real analysis',()=>{
 const path=temp(),d=open(path),r=new SimulationRuntime(d),c=config();r.create(c,{nextTieAsset:'BTC'});r.start();r.advanceCycle('0');const before=r.advanceCycle('3').confirmed;
 const g=JSON.parse(String(rows(path,'operations')[0]!.payload)) as GenesisInput,analysis=analyzeBoundary(before.state,before.runtime!.history,c,before.control.cursor.coordinatorState,false);
 const p:OperationPayload={command:{id:JSON.stringify(['AUTHORIZE',before.state.asOf]),kind:'AUTHORIZE',authorization:analysis.authorization},evidence:{coordinator:analysis.coordination,clock:before.control.cursor.clock,generator:before.control.cursor.generator,runtime:createRuntimeEvidence(g,before.state,before.control.cursor)}};
 const counts=['operations','events','postings'].map(t=>rows(path,t).length);
 expect(()=>d.commitOperation({simulationId:'sim',operationId:'beyond-end',expectedRevision:before.control.revision,payload:canonical(p)})).toThrow('SOURCE_EXHAUSTED');
 expect(['operations','events','postings'].map(t=>rows(path,t).length)).toEqual(counts);expect(r.snapshot().confirmed.state).toEqual(before.state);
});

test('D5 fixture recovery preserves real authorization, settlement and an open position at EOF',()=>{
 // Source/D5 contract test, not a runtime warmup shortcut or full operational E2E.
 // The real analytical chain receives all 150 complete hours; no prepared decision or score.
 const clock=new SimulationClock('2026-01-01T00:00:00.000Z'),seeded=new SeededGenerator(clock,{seed:'fixture-1',initialPrices:{BTC:'100.00000000',ETH:'100.00000000'}});
 const history:Record<Asset,Candle[]>={BTC:[],ETH:[]};for(let i=0;i<1804;i++)for(const c of seeded.next())history[c.asset].push(c);
 const at=clock.snapshot().currentTime,end=new Date(Date.parse(at)+300000).toISOString(),base=config();
 const batch=(['BTC','ETH'] as const).map(asset=>{const p=history[asset].at(-1)!.close;return {asset,openTime:at,closeTime:end,open:p,high:p,low:p,close:p,volume:'1.00000000'};}) as unknown as CandleBatch;
 const body={version:'1' as const,id:'open-position',startTime:at,batches:[batch]},hash=fixtureManifestHash(body),identity='fixture-market/1:'+hash;
 const event=(category:'CRYPTO'|'MACRO',sequence:number)=>({eventId:category,groupId:category,revision:1,previousEventId:null,source:'simulation',publishedAt:at,availableAt:at,sequence,category,state:'CONFIRMED' as const,impacts:{BTC:{direction:1 as const,intensity:30 as const},ETH:{direction:1 as const,intensity:30 as const}}});
 const c:RuntimeConfiguration={...base,startTime:at,provider:{id:'fixture-market',version:'1',identity,seed:identity,initialPrices:{BTC:batch[0].open,ETH:batch[1].open},manifest:{...body,hash}},context:{...base.context,feed:{status:'VALID',events:[event('CRYPTO',1),event('MACRO',2)]}}};
 const initial={...portfolio(),asOf:at},g:GenesisInput={simulationId:'sim',operationId:'genesis',initial,configuration:{...configuration,clock:{startTime:at,currentTime:at,steps:0},generator:{version:'1',seed:identity,confirmedSteps:0},runtime:c}};
 const path=temp();let d=open(path);d.createSimulation(g);
 const analysis=analyzeBoundary(createExecutionState(initial),history,c,{nextTieAsset:'BTC'},true);
 expect(analysis.coordination.opportunities.some(x=>x.asset==='ETH' && x.candidate?.scoreRounded===75)).toBe(true);
 function commit(command:ExecutionCommand){
  const before=d.loadState('sim'),steps=command.kind==='CLOSE'?1:0;
  const p:OperationPayload={command,evidence:{coordinator:command.kind==='AUTHORIZE'?analysis.coordination:null,clock:{startTime:at,currentTime:command.kind==='CLOSE'?end:at,steps},generator:{version:'1',seed:identity,confirmedSteps:steps}}};
  const state=execute(before.state,p),cursor=advanceCursor(before.control.cursor,p,state);
  d.commitOperation({simulationId:'sim',operationId:command.kind,expectedRevision:before.control.revision,payload:canonical({...p,evidence:{...p.evidence,runtime:createRuntimeEvidence(g,state,cursor)}})});
  return d.loadState('sim');
 }
 const authorized=commit({id:JSON.stringify(['AUTHORIZE',at]),kind:'AUTHORIZE',authorization:analysis.authorization});expect(authorized.state.reservations.some(x=>x.status==='ACTIVE')).toBe(true);
 d.close();d=open(path,false);let recovered=d.recover('sim');expect(recovered.runtime!.mode).toBe('PAUSED');expect(recovered.state).toEqual(authorized.state);expect(recovered.control.cursor.authorizedAt).toBe(at);
 const opened=commit({id:JSON.stringify(['OPEN',at]),kind:'OPEN',asOf:at,openings:batch.map(x=>({asset:x.asset,asOf:at,price:x.open})),exits:[]});
 expect(opened.state.fills).toHaveLength(1);expect(opened.state.reservations[0]!.status).toBe('SETTLED');
 d.close();d=open(path,false);recovered=d.recover('sim');expect(recovered.state).toEqual(opened.state);expect(recovered.runtime!.phase).toBe('AFTER_OPEN');
 const closed=commit({id:JSON.stringify(['CLOSE',end]),kind:'CLOSE',asOf:end,candles:batch});expect(closed.runtime!.version==='2' && closed.runtime!.exhausted).toBe(true);
 expect(closed.state.positions.some(x=>x.status==='OPEN')).toBe(true);expect(closed.state.fills).toEqual(opened.state.fills);
 const count=rows(path,'operations').length;d.close();d=open(path,false);recovered=d.recover('sim');expect(recovered.control.status).toBe('RUNNING');expect(recovered.runtime!.mode).toBe('PAUSED');
 expect(recovered.state).toEqual(closed.state);expect(recovered.control.cursor.coordinatorState).toEqual(closed.control.cursor.coordinatorState);expect(rows(path,'operations')).toHaveLength(count);
});

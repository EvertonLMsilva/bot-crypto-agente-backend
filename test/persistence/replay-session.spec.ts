import { SqliteStore } from '../../src/persistence/sqlite-store';
import { createExecutionReplay } from '../../src/operations/execution';
import { execute, canonical } from '../../src/persistence/ledger';
import { ExecutionCommand, createExecutionState } from '../../src/operations';
import { open, temp, cleanup, portfolio, configuration, genesis, authorizationCommand, openingCommand, commit, payload, rows, raw } from './crash-worker';
import { performanceConfiguration } from './replay-perf-worker';
import { SimulationRuntime } from '../../src/runtime';
import { SeededGenerator } from '../../src/simulation/seeded-generator';
import * as marketSource from '../../src/simulation/market-source';
import { createRuntimeReplay } from '../../src/persistence/runtime-evidence';
import { genesisState } from '../../src/persistence/ledger';

afterEach(cleanup);
function closeCommand():ExecutionCommand {
 const at=configuration.clock.startTime,end='2026-01-01T01:05:00.000Z';
 return {id:JSON.stringify(['CLOSE',end]),kind:'CLOSE',asOf:end,candles:(['BTC','ETH'] as const).map(asset=>({asset,openTime:at,closeTime:end,open:'100.00000000',high:'100.00000000',low:'100.00000000',close:'100.00000000',volume:'0.00000000'}))};
}
test('session starts only inside a transaction, applies each command once and matches the public oracle',()=>{
 const store=new SqliteStore(temp(),{create:true,busyTimeoutMs:2000});
 try{
  expect(()=>store.withReplay(()=>null)).toThrow();
  store.transaction(()=>store.withReplay(check=>{
   const replay=createExecutionReplay(portfolio(),check);let oracle=createExecutionState(portfolio());
   expect(replay.snapshot()).toEqual(oracle);
   for(const command of [authorizationCommand(),openingCommand(),closeCommand()]){
    oracle=execute(oracle,JSON.parse(payload(command)));expect(replay.append(command)).toEqual(oracle);
    expect(replay.snapshot().commands).toHaveLength(oracle.commands.length);expect(Object.isFrozen(replay.snapshot())).toBe(true);
   }
   expect(replay.snapshot().positions.every(p=>p.status==='OPEN')).toBe(true);
   expect(()=>replay.append(closeCommand())).toThrow();replay.close();expect(()=>replay.snapshot()).toThrow();expect(()=>replay.append(closeCommand())).toThrow();replay.close();
  }));
 }finally{store.close();}
});
test('session cannot accept an external financial snapshot or survive its transaction/rollback',()=>{
 const store=new SqliteStore(temp(),{create:true,busyTimeoutMs:2000});let leaked:ReturnType<typeof createExecutionReplay>;
 try{
  expect(()=>store.transaction(()=>store.withReplay(check=>{leaked=createExecutionReplay(portfolio(),check);leaked.append(authorizationCommand());throw Error('abort');}))).toThrow('abort');
  expect(()=>leaked!.snapshot()).toThrow();store.transaction(()=>expect(()=>leaked!.append(openingCommand())).toThrow());
  store.transaction(()=>store.withReplay(check=>expect(()=>createExecutionReplay({...portfolio(),availableCash:'9999.00000000'},check)).toThrow()));
 }finally{store.close();}
});
test('CANCEL is terminal and byte-equivalent to the public execution path',()=>{
 const store=new SqliteStore(temp(),{create:true,busyTimeoutMs:2000});
 try{store.transaction(()=>store.withReplay(check=>{
  const replay=createExecutionReplay(portfolio(),check),a=authorizationCommand();let expected=execute(createExecutionState(portfolio()),JSON.parse(payload(a)));replay.append(a);
  const id=expected.reservations[0]!.source.id,c:ExecutionCommand={id:JSON.stringify(['CANCEL',id]),kind:'CANCEL',asOf:expected.asOf,reservationId:id,reason:'OPERATOR_CANCEL'};
  expected=execute(expected,JSON.parse(payload(c)));expect(canonical(replay.append(c))).toBe(canonical(expected));expect(()=>replay.append(c)).toThrow();replay.close();
 }));}finally{store.close();}
});
test.each(['id','order','extra','future'])('session rejects noncanonical or invalid command %s',kind=>{
 const store=new SqliteStore(temp(),{create:true,busyTimeoutMs:2000});
 try{store.transaction(()=>store.withReplay(check=>{
  const replay=createExecutionReplay(portfolio(),check);replay.append(authorizationCommand());const c:any=structuredClone(openingCommand());
  if(kind==='id')c.id='wrong';else if(kind==='order')c.openings.reverse();else if(kind==='extra')c.extra=true;else c.openings[0].asOf='2026-01-01T01:05:00.000Z';
  expect(()=>replay.append(c)).toThrow();replay.close();
 }));}finally{store.close();}
});
test('SQL iterator rejects use outside its transaction and closes after partial consumption',()=>{
 const store=new SqliteStore(temp(),{create:true,busyTimeoutMs:2000});let it:IterableIterator<Record<string,string>>;
 try{
  expect(()=>store.iterate('SELECT 1')).toThrow();
  store.transaction(()=>{it=store.iterate('SELECT 1 AS n UNION ALL SELECT 2 AS n');expect(it.next().value).toEqual({n:'1'});});
  store.transaction(()=>expect(()=>it!.next()).toThrow());
  store.transaction(()=>{const next=store.iterate('SELECT 3 AS n');expect(next.next().value).toEqual({n:'3'});next.return?.();});
 }finally{store.close();}
});
test('recovery compares checkpoints sequentially without all(checkpoints)',()=>{
 const path=temp(),d=open(path);genesis(d);commit(d);commit(d,openingCommand(),'open','1');commit(d,closeCommand(),'close','2');
 const original=SqliteStore.prototype.all,spy=jest.spyOn(SqliteStore.prototype,'all').mockImplementation(function(this:SqliteStore,sql,args){if(/FROM checkpoints/i.test(sql))throw Error('aggregate checkpoint read');return original.call(this,sql,args);});
 try{expect(d.recover('sim').control.status).toBe('RUNNING');}finally{spy.mockRestore();}
});
test.each(['first','middle','last','missing','extra'])('checkpoint %s divergence suspends without trusting its state',kind=>{
 const path=temp(),d=open(path);genesis(d);commit(d);commit(d,openingCommand(),'open','1');commit(d,closeCommand(),'close','2');
 // Add another real empty cycle through the published APIs, not manufactured checkpoint states.
 const before=d.loadState('sim'),at=before.state.asOf;
 const {coordinateEntryBatch}=require('../../src/coordination');const {authorizeEntryBatch,createAuthorizationState}=require('../../src/budget');
 const batch=coordinateEntryBatch([],at,before.control.cursor.coordinatorState),prices={BTC:{asset:'BTC',closeTime:at,close:'100.00000000',validatedClosed:true},ETH:{asset:'ETH',closeTime:at,close:'100.00000000',validatedClosed:true}};
  const a:ExecutionCommand={id:JSON.stringify(['AUTHORIZE',at]),kind:'AUTHORIZE',authorization:authorizeEntryBatch(batch,before.state.portfolio,prices,createAuthorizationState(before.state.portfolio),at)};
 const p:any=JSON.parse(payload(a));p.evidence.coordinator=batch;d.commitOperation({simulationId:'sim',operationId:'a2',expectedRevision:'3',payload:canonical(p)});
 const o:any={...openingCommand(),id:JSON.stringify(['OPEN',at]),asOf:at,openings:prices?(['BTC','ETH'] as const).map(asset=>({asset,asOf:at,price:'100.00000000'})):[]};commit(d,o,'o2','4');
 const end='2026-01-01T01:10:00.000Z',c:any={...closeCommand(),id:JSON.stringify(['CLOSE',end]),asOf:end,candles:(closeCommand() as any).candles.map((x:any)=>({...x,openTime:at,closeTime:end}))};commit(d,c,'c2','5');
 const expected=d.loadState('sim').state;raw(path,db=>{
  db.exec('DROP TRIGGER checkpoints_update; DROP TRIGGER checkpoints_delete');const list=db.prepare('SELECT * FROM checkpoints ORDER BY event_seq').all();
  const target=list[kind==='first'?0:kind==='middle'?1:2]!;
  if(kind==='missing')db.prepare('DELETE FROM checkpoints WHERE event_seq=?').run(target.event_seq!);
  else if(kind==='extra')db.prepare('INSERT INTO checkpoints SELECT simulation_id,?,revision,prefix_hash,state,state_hash,cursor,schema_version FROM checkpoints LIMIT 1').run(BigInt(String(list[1]!.event_seq))+1n);
  else db.prepare('UPDATE checkpoints SET state=? WHERE event_seq=?').run('{}',target.event_seq!);
 });
 const recovered=d.recover('sim');expect(recovered.control.status).toBe('ENTRY_SUSPENDED');expect(recovered.state).toEqual(expected);
});
test('bad checkpoint does not hide a later corrupt ledger record',()=>{
 const path=temp(),d=open(path);genesis(d);commit(d);commit(d,openingCommand(),'open','1');raw(path,db=>{
  db.exec('DROP TRIGGER checkpoints_update; DROP TRIGGER events_update');db.prepare('UPDATE checkpoints SET state=?').run('{}');db.prepare('UPDATE events SET hash=? WHERE seq=(SELECT max(seq) FROM events)').run('bad');
 });expect(()=>d.recover('sim')).toThrow();expect(rows(path,'operations')).toHaveLength(3);
});

test.each(['seeded','fixture'] as const)('%s recovery creates one market source and consumes each closed batch once',mode=>{
 const d=open(),r=new SimulationRuntime(d);r.create(performanceConfiguration(mode),{nextTieAsset:'BTC'});r.start();let rev='0';
 for(let i=0;i<3;i++)rev=r.advanceCycle(rev).confirmed.control.revision;
 const expected=r.snapshot().confirmed,create=jest.spyOn(marketSource,'createMarketSource'),next=jest.spyOn(SeededGenerator.prototype,'next');
 try{
  const after=d.recover('perf');expect(after.state).toEqual(expected.state);expect(after.runtime).toEqual(expected.runtime);expect(create).toHaveBeenCalledTimes(1);
  if(mode==='seeded')expect(next).toHaveBeenCalledTimes(3);
 }finally{create.mockRestore();next.mockRestore();}
});
test('runtime verifier revokes closed and failed sessions; a legacy origin cannot acquire evidence',()=>{
 const store=new SqliteStore(temp(),{create:true,busyTimeoutMs:2000});
 try{store.transaction(()=>store.withReplay(check=>{
  const g={simulationId:'sim',operationId:'g',initial:portfolio(),configuration},initial=genesisState(g),legacy=createRuntimeReplay(g,check);
  expect(legacy.snapshot(initial.state,initial.cursor)).toBeUndefined();
  const a=authorizationCommand(),p:any=JSON.parse(payload(a));p.evidence.runtime={version:'1'};
  expect(()=>legacy.append(p,initial.state,initial.cursor)).toThrow('Legacy');expect(()=>legacy.snapshot(initial.state,initial.cursor)).toThrow();legacy.close();
  const closed=createRuntimeReplay(g,check);closed.close();expect(()=>closed.append(p,initial.state,initial.cursor)).toThrow();
 }));}finally{store.close();}
});

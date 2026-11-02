import { DatabaseSync } from 'node:sqlite';
import { DurableExecution, canonical } from '../../src/persistence';
import { SqliteStore } from '../../src/persistence/sqlite-store';
import { SCHEMA_SQL, SCHEMA2_SQL, inspectSchema } from '../../src/persistence/schema';
import { createHash } from 'node:crypto';
import { temp, cleanup, genesis, authorizationCommand, openingCommand, payload, rows, raw, at } from './crash-worker';
import { ExecutionCommand } from '../../src/operations';
const stores:DurableExecution[]=[];
function open2(path=temp(),create=true,version:1|2=2,fault?:(point:string)=>void){const d=new DurableExecution(path,{create,schemaVersion:version,busyTimeoutMs:2000,...(fault?{fault}:{})});stores.push(d);return d;}
afterEach(()=>{for(const s of stores.splice(0))s.close();cleanup();});
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
const commandInput=(command=authorizationCommand(),operationId='authorize',expectedRevision='0')=>({simulationId:'sim',operationId,expectedRevision,payload:payload(command)});
const closed=():ExecutionCommand=>({id:JSON.stringify(['CLOSE','2026-01-01T01:05:00.000Z']),kind:'CLOSE',asOf:'2026-01-01T01:05:00.000Z',candles:(['BTC','ETH'] as const).map(asset=>({asset,openTime:at,closeTime:'2026-01-01T01:05:00.000Z',open:'100.00000000',high:'101.00000000',low:'90.00000000',close:'100.00000000',volume:'1.00000000'}))});
test('literal S1/S2 checksums and sizes remain normative',()=>{
 expect(Buffer.byteLength(SCHEMA_SQL)).toBe(3660);expect(digest(SCHEMA_SQL)).toBe('fde82db3b013743bc84d05c77a4d1fece5824c9861e7c5fa0bf58b46a654a92b');
 expect(Buffer.byteLength(SCHEMA2_SQL)).toBe(7690);expect(digest(SCHEMA2_SQL)).toBe('55ef2c66e2e3c9cfacb5267d7ad5678dafa7a8e42f1e0b2361b6cb97206c5ea1');
});
test('explicit schema2 stores one reference at genesis and CLOSE; receipt API remains unchanged',()=>{
 const path=temp(),d=open2(path);genesis(d);expect(rows(path,'checkpoint_refs')).toHaveLength(1);expect(rows(path,'checkpoints')).toEqual([]);
 const a=d.commitOperationWithSnapshot(commandInput());expect(a.snapshot!.state.reservations).toHaveLength(2);
 const o=d.commitOperationWithSnapshot(commandInput(openingCommand(),'open','1'));expect(o.snapshot!.state.fills).toHaveLength(2);expect(rows(path,'checkpoint_refs')).toHaveLength(1);
 const c=d.commitOperationWithSnapshot(commandInput(closed(),'close','2'));expect(c.snapshot).toEqual(d.loadState('sim'));expect(c.snapshot!.state.realizedPnl).toMatch(/^-/);
 expect(rows(path,'checkpoint_refs')).toHaveLength(2);expect(d.commitOperation(commandInput())).toEqual(a.receipt);expect(d.commitOperationWithSnapshot(commandInput()).snapshot).toBeNull();
 raw(path,db=>{expect(inspectSchema(db)).toBe(2);expect(()=>db.exec('DELETE FROM checkpoint_refs')).toThrow();expect(()=>db.exec('UPDATE checkpoint_refs SET hash=hash')).toThrow();});
});
test('new default is V1, existing schemas autodetect and explicit mismatches do not migrate',()=>{
 for(const version of [1,2] as const){const path=temp(),d=open2(path,true,version);genesis(d);d.close();
  const next=new SqliteStore(path,{create:false,busyTimeoutMs:1000});expect(next.schemaVersion).toBe(version);next.close();
  expect(()=>open2(path,false,version===1?2:1)).toThrow('SCHEMA_VERSION_CONFLICT');
  raw(path,db=>expect(inspectSchema(db)).toBe(version));
 }
 const path=temp(),s=new SqliteStore(path,{create:true,busyTimeoutMs:1000});expect(s.schemaVersion).toBe(1);s.close();
});
test.each([0,1])('valid V1 auto_vacuum=%s and ANALYZE statistics match the logical schema',mode=>{
 const path=temp();raw(path,db=>{db.exec('PRAGMA auto_vacuum='+mode);db.exec(SCHEMA_SQL);db.prepare('INSERT INTO schema_migrations VALUES(1,?)').run(digest(SCHEMA_SQL));db.exec('PRAGMA user_version=1;ANALYZE');});
 const s=new SqliteStore(path,{create:false,busyTimeoutMs:1000});expect(s.schemaVersion).toBe(1);s.close();
});

import { spawnStorageJob,raceStorage,closeCommand } from './storage-v2-perf-worker';
import { parseCheckpointRefRow,checkpointRefRow } from '../../src/persistence/checkpoint-ref';
function tamper(path:string,table:string,sql:string){raw(path,db=>{db.exec('PRAGMA foreign_keys=OFF');const triggers=db.prepare("SELECT sql FROM sqlite_schema WHERE type='trigger' AND tbl_name=?").all(table).map(r=>String(r.sql));const names=db.prepare("SELECT name FROM sqlite_schema WHERE type='trigger' AND tbl_name=?").all(table);for(const t of names)db.exec('DROP TRIGGER "'+t.name+'"');db.exec(sql);for(const t of triggers)db.exec(t);expect(inspectSchema(db)).toBe(2);});}
function prepare(path:string,opened=false){const d=open2(path);genesis(d);d.commitOperation(commandInput());if(opened)d.commitOperation(commandInput(openingCommand(),'open','1'));d.close();}

test.each([
 ['missing trigger',"DROP TRIGGER events_update"],['altered trigger',"DROP TRIGGER events_update; CREATE TRIGGER events_update BEFORE UPDATE ON events BEGIN SELECT 1; END"],
 ['extra object','CREATE TABLE unexpected(x TEXT)'],['extra index','CREATE INDEX unexpected ON events(kind)'],['metadata',"DROP TRIGGER schema_migrations_update;UPDATE schema_migrations SET checksum='bad'"],
 ['missing metadata',"INSERT INTO schema_migrations VALUES(2,'bad')"],['future','PRAGMA user_version=3']
])('rejects structural/metadata tampering: %s',(_name,sql)=>{const path=temp(),d=open2(path,true,1);d.close();raw(path,db=>db.exec(sql!));expect(()=>open2(path,false,1)).toThrow('schema');});
test.each([
 ['FK','REFERENCES simulations(id)',''],['column','genesis TEXT NOT NULL','genesis BLOB NOT NULL'],['constraint','CHECK(schema_version=1)','CHECK(schema_version=2)'],
 ['index order','UNIQUE(simulation_id,command_id)','UNIQUE(command_id,simulation_id)'],['missing index',',UNIQUE(simulation_id,command_id)','']
])('rejects normative DDL change: %s',(_name,from,to)=>{const path=temp();raw(path,db=>{db.exec(SCHEMA_SQL.replace(from!,to!));db.prepare('INSERT INTO schema_migrations VALUES(1,?)').run(digest(SCHEMA_SQL));db.exec('PRAGMA user_version=1');});expect(()=>open2(path,false,1)).toThrow('schema');});
test('rejects partial/unknown database and requires explicit creation',()=>{
 const path=temp();raw(path,db=>db.exec('CREATE TABLE partial(x INTEGER)'));expect(()=>open2(path,true)).toThrow('schema');
 const empty=temp();raw(empty,()=>{});expect(()=>open2(empty,false)).toThrow('Explicit create');
 for(const options of [{schemaVersion:3},{create:'yes'}])expect(()=>new SqliteStore(temp(),{create:true,busyTimeoutMs:1000,...options} as never)).toThrow();
});
test.each([false,true])('valid logical catalog rejects temp and attached objects (%s)',attached=>{const path=temp(),d=open2(path);d.close();raw(path,db=>{db.exec(attached?"ATTACH ':memory:' AS alien":'CREATE TEMP TABLE alien(x INTEGER)');expect(()=>inspectSchema(db)).toThrow('schema');});});
test.each(['hash','state_hash','receipt_hash','prefix_hash','cursor_hash','previous_ref_hash','operation_id','event_seq'])('authenticated ledger detects a changed reference %s even with recomputed hash',field=>{
 const path=temp();prepare(path,true);const d=open2(path,false);d.recover('sim');d.commitOperation(commandInput(closeCommand(),'close','2'));d.close();
 raw(path,db=>{const row=db.prepare('SELECT * FROM checkpoint_refs WHERE checkpoint_index=1').get()!;const normalized=Object.fromEntries(Object.entries(row).map(([k,v])=>[k,String(v)]));const ref=parseCheckpointRefRow(normalized);const {hash,...body}=ref;
  const mapping:Record<string,string>={state_hash:'stateHash',receipt_hash:'receiptHash',prefix_hash:'prefixHash',cursor_hash:'cursorHash',previous_ref_hash:'previousRefHash',operation_id:'operationId',event_seq:'eventSeq'};
  const key=mapping[field];const changed={...body,...(key?{[key]:field==='operation_id'?'authorize':field==='event_seq'?'3':'f'.repeat(64)}:{})};
  const newHash=field==='hash'?'f'.repeat(64):digest(canonical({domain:'BOT-CRYPTO:CHECKPOINT:REF1',reference:changed}));
  const value=field==='operation_id'?"'authorize'":field==='event_seq'?'3':"'"+'f'.repeat(64)+"'";
  tamper(path,'checkpoint_refs',`UPDATE checkpoint_refs SET ${field}=${field==='hash'?"'"+newHash+"'":value},hash='${newHash}' WHERE checkpoint_index=1`);
 });
 const next=open2(path,false);expect(next.recover('sim').control.status).toBe('ENTRY_SUSPENDED');expect(next.commitOperationWithSnapshot(commandInput()).snapshot).toBeNull();
 expect(()=>next.commitOperation(commandInput(openingCommand(),'stale','0'))).toThrow();
});
test.each(['DELETE FROM checkpoint_refs WHERE checkpoint_index=0',"UPDATE checkpoint_refs SET event_seq=999 WHERE checkpoint_index=0"])('missing/dangling reference suspends entries without replacing financial replay',sql=>{const path=temp();prepare(path);tamper(path,'checkpoint_refs',sql);expect(open2(path,false).recover('sim').control.status).toBe('ENTRY_SUSPENDED');});
test('financial corruption has precedence over checkpoint corruption',()=>{const path=temp();prepare(path);tamper(path,'checkpoint_refs',"UPDATE checkpoint_refs SET hash='"+'f'.repeat(64)+"'");tamper(path,'events',"UPDATE events SET hash='"+'f'.repeat(64)+"' WHERE seq=(SELECT max(seq) FROM events)");const next=open2(path,false);expect(()=>next.recover('sim')).toThrow();expect(JSON.parse(String(rows(path,'runtime_control').at(-1)!.payload)).status).toBe('MANUAL_REVIEW_REQUIRED');});
test.each(['schema-after-ddl','schema-after-metadata','schema-before-commit','schema-after-commit'])('initialization rollback/crash at %s',fault=>{
 for(const crash of [false,true]){const path=temp(),r=spawnStorageJob({action:'init',path,version:2,fault,crash});expect(r.crashed||r.error).toBeTruthy();raw(path,db=>expect(inspectSchema(db)).toBe(fault==='schema-after-commit'?2:0));const next=open2(path,true);expect(next.loadState).toBeDefined();}
},30000);
test.each([[1,1],[2,2],[1,2]] as (1|2)[][])('real processes initialize versions %j under writer lock',async(...versions)=>{
 const path=temp(),results=await raceStorage(path,versions as (1|2)[]);const successes=results.filter(r=>!r.error);expect(successes).toHaveLength(versions[0]===versions[1]?2:1);
 if(versions[0]!==versions[1])expect(results.find(r=>r.error).error).toContain('SCHEMA_VERSION_CONFLICT');raw(path,db=>expect([1,2]).toContain(inspectSchema(db)));
},30000);
test.each(['OPEN','CLOSE'] as const)('operation %s is atomic across process death before/after COMMIT',command=>{
 for(const fault of ['before-commit','after-commit']){const path=temp();prepare(path,command==='CLOSE');const result=spawnStorageJob({action:'write',path,version:2,command,fault,crash:true});expect(result.crashed).toBe(true);
 const next=open2(path,false),state=next.recover('sim'),base=command==='CLOSE'?2:1;expect(state.control.revision).toBe(String(base+(fault==='after-commit'?1:0)));expect(state.control.status).toBe('RUNNING');
 const retried=next.commitOperationWithSnapshot(commandInput(command==='CLOSE'?closeCommand():openingCommand(),command==='CLOSE'?'close':'open',String(base)));expect(retried.receipt.revision).toBe(String(base+1));expect(retried.snapshot).toEqual(next.loadState('sim'));
 }
},30000);
test('financial snapshots, hashes, postings and receipts equal published V1 and current V1/V2 exactly',()=>{const results=[spawnStorageJob({action:'financial',path:temp(),version:1},true),...([1,2] as const).map(version=>spawnStorageJob({action:'financial',path:temp(),version}))];for(const r of results){expect(r.error).toBeUndefined();expect(r.pnl).toMatch(/^-/);expect(r.references).toBe(3);}expect(new Set(results.map(r=>r.digest)).size).toBe(1);},30000);
test.each(['seeded','fixture'] as const)('runtime evidence %s, EOF and independent PAUSED recovery preserve V1/V2 identity',mode=>{const results=([1,2] as const).map(version=>spawnStorageJob({action:'runtime',path:temp(),version,mode,cycles:2}));for(const r of results){expect(r.error).toBeUndefined();expect(r.completed).toBe(2);expect(r.mode).toBe('PAUSED');expect(r.stop).toBeNull();}expect(results[0].digest).toBe(results[1].digest);expect(results[1].checkpointBytes).toBeLessThan(results[0].checkpointBytes);},30000);


import { concurrent } from './crash-worker';
test.each([true,false])('schema2 real operation race preserves idempotency and shared funds (%s)',async same=>{
 const path=temp(),d=open2(path);genesis(d);d.commitOperation(commandInput());d.close();const children=(same?['same','same']:['open-a','open-b']).map(id=>concurrent(path,id,'open'));
 try{
  const ready=children.map(child=>new Promise<void>((resolve,reject)=>{child.on('error',reject);child.on('message',(m:any)=>{if(m.ready)resolve();});}));
  const results=children.map(child=>new Promise<any>((resolve,reject)=>{child.on('error',reject);child.on('message',(m:any)=>{if(m.receipt||m.error)resolve(m);});}));
  await Promise.all(ready);for(const child of children)child.send('GO');const r=await Promise.all(results);
  expect(r.filter(v=>v.receipt)).toHaveLength(same?2:1);if(same)expect(r[0].receipt).toEqual(r[1].receipt);else expect(r.find(v=>v.error).error).toContain('CONFLICT');
  await Promise.all(children.map(child=>new Promise<void>(resolve=>{if(child.exitCode!==null)resolve();else child.once('exit',()=>resolve());})));
  const s=open2(path,false).recover('sim');expect(s.control.revision).toBe('2');expect(s.state.fills.map(f=>f.asset)).toEqual(['BTC','ETH']);expect(s.state.portfolio.availableCash).toBe('7996.99900000');expect(s.state.portfolio.reservedCash).toBe('0.00000000');
 }finally{for(const child of children)if(child.exitCode===null)child.kill('SIGKILL');}
},25000);
test('V2 rejects legacy checkpoint inserts and invalid REF1 sequence/linkage',()=>{const path=temp(),d=open2(path);genesis(d);raw(path,db=>{
 expect(()=>db.exec("INSERT INTO checkpoints VALUES('sim',2,0,'x','{}','x','{}',1)")).toThrow('requires REF1');
 const r=db.prepare('SELECT * FROM checkpoint_refs').get()!;const columns=Object.keys(r),values=Object.values(r);const insert=db.prepare('INSERT INTO checkpoint_refs VALUES('+columns.map(()=>'?').join(',')+')');
 expect(()=>insert.run(...values)).toThrow('REF1 order');values[columns.indexOf('checkpoint_index')]=1;values[columns.indexOf('revision')]=1;values[columns.indexOf('event_seq')]=3;values[columns.indexOf('previous_ref_hash')]=r.hash!;
 expect(()=>insert.run(...values)).toThrow('REF1 linkage');
 });});
test('mixed legacy checkpoint rows are detected with a valid schema',()=>{const path=temp(),d=open2(path);genesis(d);d.close();tamper(path,'checkpoints',"INSERT INTO checkpoints VALUES('sim',2,0,'x','{}','x','{}',1)");expect(open2(path,false).recover('sim').control.status).toBe('ENTRY_SUSPENDED');});


test.each([1,2] as const)('metadata independently rejects forged checksums/missing records for schema%s',version=>{for(const sql of ["UPDATE schema_migrations SET checksum='bad' WHERE version=1",'DELETE FROM schema_migrations WHERE version=1',"INSERT INTO schema_migrations VALUES(9,'bad')"]){const path=temp(),d=open2(path,true,version);d.close();raw(path,db=>{const ddl=db.prepare("SELECT sql FROM sqlite_schema WHERE name='schema_migrations_update'").get()!.sql,del=db.prepare("SELECT sql FROM sqlite_schema WHERE name='schema_migrations_delete'").get()!.sql;db.exec('DROP TRIGGER schema_migrations_update;DROP TRIGGER schema_migrations_delete;'+sql);db.exec(String(ddl));db.exec(String(del));});expect(()=>open2(path,false,version)).toThrow('metadata/checksum');}});
test.each([0,1])('schema2 auto_vacuum=%s accepts physical rootpage differences',mode=>{const path=temp();raw(path,db=>db.exec('PRAGMA auto_vacuum='+mode));const d=open2(path);genesis(d);d.close();raw(path,db=>{db.exec('ANALYZE');expect(inspectSchema(db)).toBe(2);});expect(open2(path,false).recover('sim').control.status).toBe('RUNNING');});
test('extra trailing authenticated reference cannot be accepted as verified financial history',()=>{const path=temp();prepare(path,true);const d=open2(path,false);d.recover('sim');d.commitOperation(commandInput(closeCommand(),'close','2'));d.close();tamper(path,'checkpoint_refs',"UPDATE checkpoint_refs SET checkpoint_index=2 WHERE checkpoint_index=1");expect(open2(path,false).recover('sim').control.status).toBe('ENTRY_SUSPENDED');});


test('raw REF1 audit binds each reference to unchanged event, operation and receipt hashes',()=>{
 const path=temp();prepare(path,true);const d=open2(path,false);d.recover('sim');d.commitOperation(commandInput(closeCommand(),'close','2'));
 raw(path,db=>{let previous='0'.repeat(64);for(const row of db.prepare('SELECT * FROM checkpoint_refs ORDER BY checkpoint_index').all()){
 const ref=parseCheckpointRefRow(Object.fromEntries(Object.entries(row).map(([k,v])=>[k,String(v)])));const operation=db.prepare('SELECT * FROM operations WHERE operation_id=?').get(ref.operationId)!,event=db.prepare('SELECT * FROM events WHERE seq=?').get(BigInt(ref.eventSeq))!,receipt=JSON.parse(String(operation.receipt));
 expect(ref.previousRefHash).toBe(previous);expect(ref.prefixHash).toBe(event.hash);expect(ref.eventSeq).toBe(receipt.seqEnd);expect(ref.stateHash).toBe(receipt.stateHash);expect(ref.receiptHash).toBe(digest(canonical(receipt)));expect(ref.cursorHash).toBe(digest(canonical(receipt.cursor)));expect(event.kind).toBe('FINANCIAL_RECONCILIATION');expect(event.phase).toBe('BEFORE_OPEN');previous=ref.hash;
 }});
});
test.each(['after-operation','after-events','after-postings'])('V2 transaction faults at %s roll back every financial/ref row',fault=>{const path=temp();prepare(path);const before=Object.fromEntries(['operations','events','postings','checkpoint_refs'].map(t=>[t,rows(path,t)]));const result=spawnStorageJob({action:'write',path,version:2,command:'OPEN',fault});expect(result.error).toContain('STORAGE_FAULT');for(const [table,data] of Object.entries(before))expect(rows(path,table)).toEqual(data);expect(open2(path,false).recover('sim').control.revision).toBe('1');},15000);

test('equivalent V1 catalogs accept different rootpage values',()=>{const roots:number[]=[];for(const mode of [0,1]){const path=temp();raw(path,db=>{db.exec('PRAGMA auto_vacuum='+mode);db.exec(SCHEMA_SQL);db.prepare('INSERT INTO schema_migrations VALUES(1,?)').run(digest(SCHEMA_SQL));db.exec('PRAGMA user_version=1');roots.push(Number(db.prepare("SELECT rootpage FROM sqlite_schema WHERE name='operations'").get()!.rootpage));expect(inspectSchema(db)).toBe(1);});}expect(roots[0]).not.toBe(roots[1]);});

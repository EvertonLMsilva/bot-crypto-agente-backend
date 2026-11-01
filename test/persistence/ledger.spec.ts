import { open, temp, genesis, commit, cleanup, payload, authorizationCommand, openingCommand } from './crash-worker';
import { raw, rows, portfolio, configuration } from './crash-worker';
afterEach(cleanup);
test('explicit genesis creates a balanced, recoverable financial origin',()=>{const d=open();const r=genesis(d);expect(r.revision).toBe('0');expect(d.loadState('sim').state.portfolio.equity).toBe('10000.00000000');});
test('genesis and every committed operation have exact balanced signed postings',()=>{
 const path=temp(),d=open(path);genesis(d);commit(d);commit(d,openingCommand(),'open','1');
 const grouped=new Map<string,bigint>();for(const p of rows(path,'postings')){const seq=String(p.event_seq),amount=String(p.amount);grouped.set(seq,(grouped.get(seq)??0n)+BigInt(amount.replace('.','')));}
 expect([...grouped.values()].every(v=>v===0n)).toBe(true);expect(rows(path,'events').every(e=>e.schema_version===1)).toBe(true);
 expect(d.loadState('sim').state.portfolio.equity).toBe('9996.99900000');
});
test('money beyond2^53 survives SQLite TEXT roundtrip without Number conversion',()=>{
 const path=temp(),d=open(path),money='9007199254740993.00000001';genesis(d,{...portfolio(),equity:money,availableCash:money,dayOpeningEquity:money});
 const p=rows(path,'postings');expect(p.some(v=>v.amount===money)).toBe(true);d.close();const restored=open(path,false).recover('sim');expect(restored.state.portfolio.equity).toBe(money);
});
test('operational ledger tables reject UPDATE and DELETE, even through SQL',()=>{
 const path=temp(),d=open(path);genesis(d);
 raw(path,db=>{for(const table of ['events','postings','operations','simulations','checkpoints','runtime_control','schema_migrations']){
 expect(()=>db.exec(`DELETE FROM ${table}`)).toThrow();expect(()=>db.exec(`UPDATE ${table} SET ${table==='simulations'?'id=id':table==='operations'?'receipt=receipt':table==='events'?'hash=hash':table==='postings'?'amount=amount':table==='checkpoints'?'state=state':table==='runtime_control'?'payload=payload':'checksum=checksum'}`)).toThrow();}});
});
test('explicit creation is idempotent; divergent genesis, unsupported engine and implicit funds reject',()=>{
 const d=open(),first=genesis(d);expect(genesis(d)).toEqual(first);
 expect(()=>genesis(d,{...portfolio(),equity:'1.00000000',availableCash:'1.00000000'})).toThrow(RangeError);
 expect(()=>d.createSimulation({simulationId:'other',operationId:'genesis',initial:portfolio(),configuration:{...configuration,engineVersion:'future'}})).toThrow(RangeError);
 expect(()=>d.loadState('absent')).toThrow();
});
test('absent database is never silently opened or seeded; explicit pragmas are active',()=>{
 const path=temp();expect(()=>open(path,false)).toThrow(RangeError);const d=open(path);genesis(d);
 raw(path,db=>{expect(db.prepare('PRAGMA journal_mode').get()!.journal_mode).toBe('wal');});
 expect(()=>open('relative.sqlite')).toThrow(RangeError);
});
test('schema future and migration checksum divergence reject before use',()=>{
 for(const mode of ['future','checksum']){const path=temp(),d=open(path);genesis(d);d.close();raw(path,db=>{
 if(mode==='future')db.exec('PRAGMA user_version=2');else db.exec("DROP TRIGGER schema_migrations_update;UPDATE schema_migrations SET checksum='bad'");});
 expect(()=>open(path,false)).toThrow(RangeError);}
});
test('initial migration failure rolls back DDL without partially creating financial tables',()=>{
 const path=temp();raw(path,db=>db.exec('CREATE TABLE operations(unrelated TEXT)'));
 expect(()=>open(path,false)).toThrow();raw(path,db=>expect(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r=>r.name)).toEqual(['operations']));
});
test('duplicate ledger events are rejected by database uniqueness constraints',()=>{
 const path=temp(),d=open(path);genesis(d);raw(path,db=>expect(()=>db.exec('INSERT INTO events SELECT * FROM events WHERE seq=1')).toThrow());
 expect(d.recover('sim').control.status).toBe('RUNNING');
});

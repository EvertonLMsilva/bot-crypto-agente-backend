import { DurableExecution, OperationInput, canonical } from '../../src/persistence';
import { ExecutionCommand } from '../../src/operations';
import { SqliteStore } from '../../src/persistence/sqlite-store';
import * as recovery from '../../src/persistence/recovery';
import { SimulationRuntime } from '../../src/runtime';
import { performanceConfiguration } from './replay-perf-worker';
import { open, temp, cleanup, genesis, authorizationCommand, openingCommand, payload, rows, raw, at, crash } from './crash-worker';

afterEach(cleanup);
const input=(command=authorizationCommand(),operationId='authorize',expectedRevision='0'):OperationInput=>({simulationId:'sim',operationId,expectedRevision,payload:payload(command)});
function closeCommand():ExecutionCommand {return {kind:'CLOSE',id:JSON.stringify(['CLOSE','2026-01-01T01:05:00.000Z']),asOf:'2026-01-01T01:05:00.000Z',candles:(['BTC','ETH'] as const).map(asset=>({asset,openTime:at,closeTime:'2026-01-01T01:05:00.000Z',open:'100.00000000',high:'101.00000000',low:'90.00000000',close:'100.00000000',volume:'1.00000000'}))};}
function frozen(value:unknown):void {if(value && typeof value==='object'){expect(Object.isFrozen(value)).toBe(true);for(const v of Object.values(value))frozen(v);}}

test('confirmed snapshot is detached, deeply immutable and exactly matches independent reconstruction',()=>{
 const d=open();genesis(d);const result=d.commitOperationWithSnapshot(input());
 expect(result.disposition).toBe('COMMITTED');expect(result.simulationId).toBe('sim');expect(result.revision).toBe('1');
 expect(result.snapshot).toEqual(d.loadState('sim'));expect(result.snapshot!.control.stateHash).toBe(result.receipt.stateHash);frozen(result);
 expect(()=>Object.assign(result.snapshot!.state,{availableCash:'0.00000000'})).toThrow();
 const copy=structuredClone(result);Object.assign(copy.snapshot!.state,{availableCash:'0.00000000'});expect(d.loadState('sim')).toEqual(result.snapshot);
});

test('snapshot publication occurs after SQLite COMMIT, including commit failure',()=>{
 const d=open();genesis(d);const original=SqliteStore.prototype.transaction,transaction=jest.spyOn(SqliteStore.prototype,'transaction');
 let completed=false;transaction.mockImplementation(function<T>(this:SqliteStore,fn:()=>T):T {const result=original.call(this,()=>{expect(this.db.isTransaction).toBe(true);return fn();}) as T;completed=true;expect(this.db.isTransaction).toBe(false);return result;});
 try{const result=d.commitOperationWithSnapshot(input());expect(completed).toBe(true);expect(result.revision).toBe('1');}finally{transaction.mockRestore();}
 const path=temp(),other=open(path);genesis(other);raw(path,db=>db.exec(`CREATE TABLE deferred_child(id INTEGER REFERENCES simulations(id) DEFERRABLE INITIALLY DEFERRED); CREATE TRIGGER fail_commit AFTER INSERT ON operations WHEN NEW.revision>0 BEGIN INSERT INTO deferred_child VALUES('absent'); END;`));
 expect(()=>other.commitOperationWithSnapshot(input())).toThrow();expect(rows(path,'operations')).toHaveLength(1);
});

test.each(['after-operation','after-events','after-postings','before-commit'])('%s rollback publishes no speculative snapshot',point=>{
 let armed=false,published:unknown;const path=temp(),d=open(path,true,p=>{if(armed && p===point)throw Error('rollback');});genesis(d);const before=d.loadState('sim');armed=true;
 expect(()=>{published=d.commitOperationWithSnapshot(input());}).toThrow('rollback');expect(published).toBeUndefined();armed=false;
 expect(d.recover('sim').state).toEqual(before.state);expect(rows(path,'operations')).toHaveLength(1);
});

test('lost response replays original receipt and snapshot without duplicating holds or fills',()=>{
 let armed=false;const path=temp(),d=open(path,true,p=>{if(armed && p==='after-commit')throw Error('lost response');});genesis(d);armed=true;
 expect(()=>d.commitOperationWithSnapshot(input())).toThrow('lost response');armed=false;
 const replay=d.commitOperationWithSnapshot(input());expect(replay.disposition).toBe('REPLAY');expect(replay.snapshot!.control.revision).toBe('1');
 expect(d.commitOperation(input())).toEqual(replay.receipt);expect(rows(path,'operations')).toHaveLength(2);expect(replay.snapshot!.state.reservations).toHaveLength(2);
});

test('old receipt never receives the advanced head snapshot; stale new write fails closed',()=>{
 const d=open();genesis(d);const first=d.commitOperationWithSnapshot(input());const opened=d.commitOperationWithSnapshot(input(openingCommand(),'open','1'));
 const old=d.commitOperationWithSnapshot(input());expect(old.receipt).toEqual(first.receipt);expect(old.revision).toBe('1');expect(old.snapshot).toBeNull();
 expect(opened.revision).toBe('2');expect(first.snapshot!.control.revision).toBe('1');
 expect(()=>d.commitOperationWithSnapshot(input(closeCommand(),'close','1'))).toThrow('CONFLICT');expect(d.loadState('sim').control.revision).toBe('2');
 expect(()=>d.commitOperationWithSnapshot({...input(),payload:payload(openingCommand())})).toThrow('Divergent payload');
});

test.each(['events','checkpoints'] as const)('tampered %s cannot certify a snapshot',table=>{
 const path=temp(),d=open(path);genesis(d);raw(path,db=>{db.exec('DROP TRIGGER '+table+'_update');db.exec(table==='events'?`UPDATE events SET hash='bad'`:`UPDATE checkpoints SET state='{}'`);});
 expect(()=>d.commitOperationWithSnapshot(input())).toThrow();expect(rows(path,'operations')).toHaveLength(1);
 if(table==='checkpoints')expect(d.loadState('sim').control.status).toBe('ENTRY_SUSPENDED');else expect(()=>d.loadState('sim')).toThrow('locally blocked');
});

test.each(['operations','events','postings','checkpoints','runtime_control'])('new %s rows are read back before snapshot certification',table=>{
 const path=temp(),d=open(path);genesis(d);d.commitOperationWithSnapshot(input());d.commitOperationWithSnapshot(input(openingCommand(),'open','1'));
 raw(path,db=>{db.exec('DROP TRIGGER '+table+'_update');const column=table==='operations'?'receipt':table==='events'?'hash':table==='postings'?'amount':table==='checkpoints'?'state':'hash';
 db.exec(`CREATE TRIGGER corrupt_new AFTER INSERT ON ${table} BEGIN UPDATE ${table} SET ${column}='bad' WHERE rowid=NEW.rowid; END;`);});
 let result:unknown;expect(()=>{result=d.commitOperationWithSnapshot(input(closeCommand(),'close','2'));}).toThrow('COMMIT_SNAPSHOT');expect(result).toBeUndefined();expect(rows(path,'operations')).toHaveLength(3);
});

test('AUTHORIZE, CANCEL, OPEN and CLOSE preserve reservations, positions and signed PnL',()=>{
 const d=open();genesis(d);const auth=d.commitOperationWithSnapshot(input());const reservation=auth.snapshot!.state.reservations[0]!;
 const cancel:ExecutionCommand={kind:'CANCEL',id:JSON.stringify(['CANCEL',reservation.source.id]),asOf:at,reservationId:reservation.source.id,reason:'OPERATOR_CANCEL'};
 const cancelled=d.commitOperationWithSnapshot(input(cancel,'cancel','1'));expect(cancelled.snapshot).toEqual(d.loadState('sim'));
 const opened=d.commitOperationWithSnapshot(input(openingCommand(),'open','2'));expect(opened.snapshot!.state.positions.some(p=>p.status==='OPEN')).toBe(true);
 const closed=d.commitOperationWithSnapshot(input(closeCommand(),'close','3'));expect(closed.snapshot).toEqual(d.loadState('sim'));
 expect(d.commitOperationWithSnapshot(input(cancel,'cancel','0')).snapshot).toBeNull();
});

test.each(['seeded','fixture'] as const)('%s runtime normal cycle performs four full reconstructions and no post-commit loadState',mode=>{
 const d=open(),r=new SimulationRuntime(d);r.create(performanceConfiguration(mode,1),{nextTieAsset:'BTC'});r.start();
 const replay=jest.spyOn(recovery,'reconstruct'),load=jest.spyOn(d,'loadState');
 try{const snapshot=r.advanceCycle('0');expect(replay).toHaveBeenCalledTimes(4);expect(load).toHaveBeenCalledTimes(1);
 expect(snapshot.confirmed).toEqual(d.loadState('perf'));expect(snapshot.confirmed.runtime!.history.BTC).toHaveLength(1);
 if(mode==='fixture'){expect(snapshot.mode).toBe('PAUSED');expect(snapshot.diagnostic).toBe('SOURCE_EXHAUSTED');expect(()=>r.advanceCycle('3')).toThrow('Explicit start');}
 }finally{replay.mockRestore();load.mockRestore();}
});

test.each([['crash-before','1',0],['crash-after','2',2]] as const)('real %s returns only durable revisions on snapshot replay',(mode,rev,fills)=>{
 const path=temp(),d=open(path);genesis(d);d.commitOperationWithSnapshot(input());d.close();const killed=crash(path,mode);expect(killed.error).toBeUndefined();expect(killed.status).not.toBe(0);
 const next=open(path,false),recovered=next.recover('sim');expect(recovered.control.revision).toBe(rev);expect(recovered.state.fills).toHaveLength(fills);
 const result=next.commitOperationWithSnapshot(input(openingCommand(),'open','1'));expect(result.snapshot!.state.fills).toHaveLength(2);expect(result.snapshot).toEqual(next.loadState('sim'));
});

test('a different process after COMMIT cannot change the returned snapshot revision',()=>{
 const {spawnDiagnostic}=require('./commit-snapshot-perf-worker') as typeof import('./commit-snapshot-perf-worker');
 const path=temp();let armed=false,other:any;
 const d=open(path,true,p=>{if(armed && p==='after-commit'){armed=false;other=spawnDiagnostic('writer',[path,'open','other-open','1']);}});genesis(d);armed=true;
 const result=d.commitOperationWithSnapshot(input());expect(other.error).toBeUndefined();expect(other.revision).toBe('2');expect(result.revision).toBe('1');expect(result.snapshot!.control.revision).toBe('1');expect(result.snapshot!.state.fills).toEqual([]);
 expect(()=>d.commitOperationWithSnapshot(input(openingCommand(),'own-open','1'))).toThrow('CONFLICT');expect(d.loadState('sim').state.fills).toHaveLength(2);
});

test('another process before the writer lock causes a stale revision rejection',()=>{
 const {spawnDiagnostic}=require('./commit-snapshot-perf-worker') as typeof import('./commit-snapshot-perf-worker');
 const path=temp(),d=open(path);genesis(d);const other=spawnDiagnostic('writer',[path,'authorize','other-authorize','0']);expect(other.revision).toBe('1');
 expect(()=>d.commitOperationWithSnapshot(input())).toThrow('CONFLICT');expect(rows(path,'operations')).toHaveLength(2);
});

test('financial baseline and optimized modules yield byte-identical state, receipts and all tables',()=>{
 const {spawnDiagnostic}=require('./commit-snapshot-perf-worker') as typeof import('./commit-snapshot-perf-worker');
 const baseline=spawnDiagnostic('financial',[temp()],true),optimized=spawnDiagnostic('financial',[temp()]);
 expect(baseline.error).toBeUndefined();expect(optimized.error).toBeUndefined();expect(optimized).toEqual(baseline);expect(optimized.realizedPnl).toMatch(/^-/);
});

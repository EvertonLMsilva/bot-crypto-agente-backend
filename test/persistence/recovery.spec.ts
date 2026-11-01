import { open, temp, genesis, commit, cleanup, payload, authorizationCommand, openingCommand } from './crash-worker';
import { raw, rows, at } from './crash-worker';
afterEach(cleanup);
test('restart blocks entries until recovery and restores the exact confirmed state',()=>{const path=temp(),d=open(path);genesis(d);commit(d);const prior=d.loadState('sim').state;d.close();const next=open(path,false);expect(next.loadState('sim').control.status).toBe('RECOVERING');expect(next.recover('sim').state).toEqual(prior);expect(next.loadState('sim').control.status).toBe('RUNNING');});
test('opening without closing restores OPEN positions, protections and exact BTC/ETH capital',()=>{
 const path=temp(),d=open(path);genesis(d);commit(d);commit(d,openingCommand(),'open','1');const prior=d.loadState('sim').state;d.close();
 const n=open(path,false);expect(()=>commit(n,openingCommand(),'different','2')).toThrow();const r=n.recover('sim');
 expect(r.state).toEqual(prior);expect(r.control.cursor.phase).toBe('AFTER_OPEN');expect(r.state.positions.every(p=>p.status==='OPEN')).toBe(true);
});
test.each([
 ['hash',"DROP TRIGGER events_update;UPDATE events SET hash='bad' WHERE seq=1"],
 ['sequence gap',"DROP TRIGGER events_delete;DELETE FROM events WHERE seq=1"],
 ['posting',"DROP TRIGGER postings_update;UPDATE postings SET amount='0.00000001' WHERE ordinal=1"],
 ['receipt',"DROP TRIGGER operations_update;UPDATE operations SET receipt='{}' WHERE revision=0"],
 ['control',"DROP TRIGGER runtime_control_update;UPDATE runtime_control SET hash='bad' WHERE control_seq=1"]
])('corrupted %s causes fail-closed MANUAL_REVIEW_REQUIRED',(_label,sql)=>{
 const path=temp(),d=open(path);genesis(d);commit(d);raw(path,db=>db.exec(sql));
 expect(()=>d.recover('sim')).toThrow();expect(()=>commit(d,openingCommand(),'open','1')).toThrow();
 const latest=rows(path,'runtime_control').at(-1)!;expect(JSON.parse(String(latest.payload)).status).toBe('MANUAL_REVIEW_REQUIRED');
});
test('corrupted derived checkpoint never replaces valid ledger and suspends entries',()=>{
 const path=temp(),d=open(path);genesis(d);commit(d);const prior=d.loadState('sim').state;
 raw(path,db=>db.exec("DROP TRIGGER checkpoints_update;UPDATE checkpoints SET state='{}'"));
 const r=d.recover('sim');expect(r.control.status).toBe('ENTRY_SUSPENDED');expect(r.state).toEqual(prior);
 expect(()=>commit(d,openingCommand(),'open','1')).toThrow();expect(d.recover('sim',true).control.status).toBe('ENTRY_SUSPENDED');
});
test('suspension requires explicit idempotent cancellation before an opening can run safely',()=>{
 const d=open();genesis(d);commit(d);let r=d.suspendEntries('sim','CRITICAL_GUARD');expect(()=>commit(d,openingCommand(),'open','1')).toThrow();
 for(const [i,v] of r.state.reservations.entries()){
 const c={id:JSON.stringify(['CANCEL',v.source.id]),kind:'CANCEL' as const,reservationId:v.source.id,reason:'ENTRY_SUSPENDED',asOf:at};
 const receipt=commit(d,c,`cancel${i}`,String(1+i));expect(commit(d,c,`cancel${i}`,'0')).toEqual(receipt);
 }
 expect(d.loadState('sim').state.portfolio.availableCash).toBe('10000.00000000');commit(d,openingCommand(),'open','3');
 expect(d.loadState('sim').state.fills).toEqual([]);expect(d.recover('sim').control.status).toBe('ENTRY_SUSPENDED');expect(d.recover('sim',true).control.status).toBe('RUNNING');
});
test('loadState and commit persist a checkpoint suspension without trusting its state',()=>{
 for(const method of ['load','commit']){const path=temp(),d=open(path);genesis(d);commit(d);raw(path,db=>db.exec("DROP TRIGGER checkpoints_update;UPDATE checkpoints SET prefix_hash='bad'"));
 if(method==='load')expect(d.loadState('sim').control.status).toBe('ENTRY_SUSPENDED');else expect(()=>commit(d,openingCommand(),'open','1')).toThrow();
 expect(JSON.parse(String(rows(path,'runtime_control').at(-1)!.payload)).status).toBe('ENTRY_SUSPENDED');}
});
test('startup with a corrupt control chain remains locally blocked and records manual review when possible',()=>{
 const path=temp(),d=open(path);genesis(d);d.close();raw(path,db=>db.exec("DROP TRIGGER runtime_control_update;UPDATE runtime_control SET hash='bad'"));
 const n=open(path,false);expect(()=>n.loadState('sim')).toThrow();expect(JSON.parse(String(rows(path,'runtime_control').at(-1)!.payload)).status).toBe('MANUAL_REVIEW_REQUIRED');
});

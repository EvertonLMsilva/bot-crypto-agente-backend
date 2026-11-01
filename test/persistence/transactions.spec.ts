import { open, temp, genesis, commit, cleanup, payload, authorizationCommand, openingCommand } from './crash-worker';
import { crash, rows } from './crash-worker';
afterEach(cleanup);
test('one committed D4 authorization persists both holds atomically',()=>{const d=open();genesis(d);const r=commit(d);expect(r.revision).toBe('1');expect(d.loadState('sim').state.reservations).toHaveLength(2);});
test.each(['after-operation','after-events','after-postings','before-commit'])('injected failure at %s rolls back both fills and all postings',point=>{
 let armed=false;const path=temp(),d=open(path,true,p=>{if(armed&&p===point)throw Error('injected');});genesis(d);commit(d);const before=d.loadState('sim').state;
 const count=rows(path,'events').length;armed=true;expect(()=>commit(d,openingCommand(),'open','1')).toThrow();armed=false;
 expect(d.recover('sim').state).toEqual(before);expect(rows(path,'events')).toHaveLength(count);expect(rows(path,'operations')).toHaveLength(2);
});
test('lost response after real COMMIT returns stored receipt without another fill',()=>{
 let armed=false;const d=open(undefined,true,p=>{if(armed&&p==='after-commit')throw Error('response lost');});genesis(d);commit(d);armed=true;
 expect(()=>commit(d,openingCommand(),'open','1')).toThrow('response lost');armed=false;
 const r=commit(d,openingCommand(),'open','1');expect(r.revision).toBe('2');expect(d.loadState('sim').state.fills).toHaveLength(2);
 expect(commit(d,openingCommand(),'open','0')).toEqual(r);
});
test.each([['crash-before','1',0],['crash-after','2',2]])('real process termination %s recovers committed effects only',(mode,rev,fills)=>{
 const path=temp(),d=open(path);genesis(d);commit(d);d.close();const killed=crash(path,mode);
 expect(killed.error).toBeUndefined();expect(killed.status===null || killed.status!==0).toBe(true);
 const next=open(path,false),restored=next.recover('sim');expect(restored.control.revision).toBe(rev);expect(restored.state.fills).toHaveLength(fills);
 const receipt=commit(next,openingCommand(),'open','1');expect(receipt.revision).toBe('2');expect(next.loadState('sim').state.fills).toHaveLength(2);
});

import { open, temp, genesis, commit, cleanup, payload, authorizationCommand, openingCommand } from './crash-worker';
import { concurrent } from './crash-worker';
async function race(path:string,ids:string[],kind='authorize'){
 const children=ids.map(id=>concurrent(path,id,kind));
 try{
 const ready=children.map(child=>new Promise<void>((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Worker readiness timeout')),15000);
  child.on('error',reject);child.on('message',(m:unknown)=>{if((m as {ready?:boolean}).ready){clearTimeout(timer);resolve();}});
 }));
 const results=children.map(child=>new Promise<Record<string,unknown>>((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Worker transaction timeout')),15000);
  child.on('message',(m:unknown)=>{const result=m as Record<string,unknown>;if(result.receipt||result.error){clearTimeout(timer);resolve(result);}});
 }));
 await Promise.all(ready);for(const child of children)child.send('GO');const out=await Promise.all(results);
 await Promise.all(children.map(child=>new Promise<void>(resolve=>{if(child.exitCode!==null)resolve();else child.once('exit',()=>resolve());})));return out;
 }finally{for(const child of children)if(child.exitCode===null)child.kill('SIGKILL');}
}
afterEach(cleanup);
test('independent connections reject a different stale operation',()=>{const path=temp(),a=open(path);genesis(a);const b=open(path,false);b.recover('sim');commit(a);expect(()=>commit(b,authorizationCommand(),'other','0')).toThrow();expect(b.loadState('sim').control.revision).toBe('1');});
test('two real processes confirm the same batch once and return the same receipt',async()=>{
 const path=temp(),d=open(path);genesis(d);d.close();const r=await race(path,['same','same']);
 expect(r.every(v=>v.receipt)).toBe(true);expect(r[0]!.receipt).toEqual(r[1]!.receipt);
 const restored=open(path,false).recover('sim');expect(restored.control.revision).toBe('1');expect(restored.state.reservations).toHaveLength(2);
},25000);
test('different operations racing at the same revision cannot consume shared funds twice',async()=>{
 const path=temp(),d=open(path);genesis(d);commit(d);d.close();const r=await race(path,['open-a','open-b'],'open');
 expect(r.filter(v=>v.receipt)).toHaveLength(1);expect(String(r.find(v=>v.error)!.error)).toContain('CONFLICT');
 const s=open(path,false).recover('sim');expect(s.control.revision).toBe('2');expect(s.state.fills.map(f=>f.asset)).toEqual(['BTC','ETH']);
 expect(s.state.portfolio.availableCash).toBe('7996.99900000');expect(s.state.portfolio.reservedCash).toBe('0.00000000');
},25000);

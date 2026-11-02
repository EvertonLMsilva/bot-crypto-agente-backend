/** Storage contract worker: all databases/artifacts are temporary, never project fixtures. */
import { DatabaseSync } from 'node:sqlite';
import { fork, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { DurableExecution, canonical, StoreOptions } from '../../src/persistence';
import { SimulationRuntime } from '../../src/runtime';
import { performanceConfiguration } from './replay-perf-worker';
import { genesis, authorizationCommand, openingCommand, payload, rows, at, prices } from './crash-worker';
import { ExecutionCommand } from '../../src/operations';
import { authorizeEntryBatch,createAuthorizationState } from '../../src/budget';
import { coordinateEntryBatch } from '../../src/coordination';
export function closeCommand(start=at,open='100.00000000',low='99.00000000'):ExecutionCommand {
 const end=new Date(Date.parse(start)+300000).toISOString();return {kind:'CLOSE',id:JSON.stringify(['CLOSE',end]),asOf:end,candles:(['BTC','ETH'] as const).map(asset=>({asset,openTime:start,closeTime:end,open,high:open,low,close:open,volume:'1.00000000'}))};
}
export interface StorageJob {readonly action:'init'|'financial'|'runtime'|'write'|'recover';readonly path:string;readonly version:1|2;readonly fault?:string;readonly crash?:boolean;readonly gate?:string;readonly command?:'OPEN'|'CLOSE';readonly cycles?:number;readonly mode?:'seeded'|'fixture';readonly timeMs?:number}
function temporary(path:string):void {if(!resolve(path).startsWith(resolve(tmpdir())+sep))throw Error('Storage worker requires an external temporary database');}
export function runStorageJob(job:StorageJob):unknown {
 temporary(job.path);let armed=false;
 const options:StoreOptions={create:job.action==='init'||job.action==='financial'||job.action==='runtime',schemaVersion:job.version,busyTimeoutMs:3000,fault:point=>{
  if(point==='schema-inspected' && job.gate){process.send?.({inspected:true});const deadline=performance.now()+10000;
   while(!existsSync(job.gate)){if(performance.now()>deadline)throw Error('Storage gate expired');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,5);}}
  if(point===job.fault && (point.startsWith('schema-')||armed)){if(job.crash)process.kill(process.pid,'SIGKILL');throw Error('STORAGE_FAULT:'+point);}
 }};
 const d=new DurableExecution(job.path,options);
 try{
  if(job.action==='init')return {version:job.version,metadata:rows(job.path,'schema_migrations')};
  if(job.action==='recover')return d.recover('sim');
  if(job.action==='write'){
   d.recover('sim');armed=true;const command=job.command==='CLOSE'?closeCommand():openingCommand();return d.commitOperationWithSnapshot({simulationId:'sim',operationId:job.command==='CLOSE'?'close':'open',expectedRevision:job.command==='CLOSE'?'2':'1',payload:payload(command)});
  }
  if(job.action==='financial'){
   genesis(d);const receipts:unknown[]=[],snapshots:unknown[]=[];
   function write(command:ExecutionCommand,id:string,extra:Record<string,unknown>={}){
    const before=d.loadState('sim'),p=payload(command,extra),r=d.commitOperationWithSnapshot({simulationId:'sim',operationId:id,expectedRevision:before.control.revision,payload:p});
    const independent=d.loadState('sim');if(canonical(r.snapshot)!==canonical(independent))throw Error('Snapshot differs from independent recovery');
    snapshots.push(independent);receipts.push(r.receipt);return independent;
   }
   const a=write(authorizationCommand(),'authorize'),reservation=a.state.reservations[0]!.source.id;
   write({kind:'CANCEL',id:JSON.stringify(['CANCEL',reservation]),asOf:at,reservationId:reservation,reason:'OPERATOR_CANCEL'},'cancel');
   write(openingCommand(),'open');const c=write(closeCommand(),'close'),time=c.state.asOf,coordinator=coordinateEntryBatch([],time,c.control.cursor.coordinatorState);
   const authorization=authorizeEntryBatch(coordinator,c.state.portfolio,prices,createAuthorizationState(c.state.portfolio),time);
   write({kind:'AUTHORIZE',id:JSON.stringify(['AUTHORIZE',time]),authorization},'authorize2',{coordinator});
   const gap:ExecutionCommand={kind:'OPEN',id:JSON.stringify(['OPEN',time]),asOf:time,openings:(['BTC','ETH'] as const).map(asset=>({asset,asOf:time,price:'90.00000000'})),exits:[]};
   write(gap,'gap');const final=write(closeCommand(time,'90.00000000','89.00000000'),'close2');
   const old=d.commitOperationWithSnapshot({simulationId:'sim',operationId:'authorize',expectedRevision:'0',payload:payload(authorizationCommand())});
   if(old.snapshot!==null||canonical(old.receipt)!==canonical(receipts[0]))throw Error('Old receipt identity changed');
   const recovered=d.recover('sim');if(canonical(recovered.state)!==canonical(final.state))throw Error('Financial recovery diverged');
   const tables=Object.fromEntries(['simulations','operations','events','postings','runtime_control'].map(t=>[t,rows(job.path,t)]));
   const digest=createHash('sha256').update(canonical({snapshots,receipts,recovered,tables})).digest('hex');
   return {digest,pnl:final.state.realizedPnl,equity:final.state.portfolio.equity,references:rows(job.path,job.version===1?'checkpoints':'checkpoint_refs').length};
  }
  const cycles=job.cycles??2;if(!Number.isInteger(cycles)||cycles<1||cycles>32)throw Error('Only bounded <=32 cycles authorized');
  const timeMs=job.timeMs??50000;if(timeMs<=0||timeMs>50000)throw Error('Unsafe time limit');
  const mode=job.mode??'seeded',config=performanceConfiguration(mode,cycles),runtime=new SimulationRuntime(d),samples:unknown[]=[],start=performance.now();let stop:string|null=null;
  runtime.create(config,{nextTieAsset:'BTC'});runtime.start();let revision='0';
  for(let i=0;i<cycles;i++){
   if(performance.now()-start>=timeMs){stop='TIME_LIMIT';break;}const t=performance.now(),result=runtime.advanceCycle(revision);revision=result.confirmed.control.revision;
   const databaseBytes=[job.path,job.path+'-wal',job.path+'-shm'].reduce((n,p)=>n+(existsSync(p)?statSync(p).size:0),0),heapMiB=process.memoryUsage().heapUsed/1048576,rssMiB=process.resourceUsage().maxRSS/1024;
   samples.push({cycle:i+1,ms:performance.now()-t,databaseBytes,heapMiB,rssMiB});
   if(databaseBytes>256*1048576||heapMiB>384||rssMiB>512){stop='RESOURCE_LIMIT';break;}
  }
  const before=runtime.snapshot();runtime.close();const next=new DurableExecution(job.path,{create:false,schemaVersion:job.version,busyTimeoutMs:3000}),resumed=new SimulationRuntime(next);const t=performance.now();
  try{
   const after=resumed.resume(config.simulationId);if(after.mode!=='PAUSED'||canonical(after.confirmed.state)!==canonical(before.confirmed.state)||canonical(after.confirmed.runtime)!==canonical(before.confirmed.runtime))throw Error('Runtime recovery diverged');
   const tables=Object.fromEntries(['simulations','operations','events','postings','runtime_control'].map(t=>[t,rows(job.path,t)]));
   const db=new DatabaseSync(job.path,{readOnly:true});let checkpointBytes:number;
   try{checkpointBytes=Number(db.prepare(job.version===1?'SELECT coalesce(sum(length(CAST(state AS BLOB))),0) n FROM checkpoints':'SELECT coalesce(sum(length(simulation_id)+length(operation_id)+length(format)+length(kind)+length(genesis_hash)+length(prefix_hash)+length(state_hash)+length(cursor_hash)+length(receipt_hash)+length(previous_ref_hash)+length(hash)+length(CAST(checkpoint_index AS TEXT))+length(CAST(revision AS TEXT))+length(CAST(event_seq AS TEXT))),0) n FROM checkpoint_refs').get()!.n);}finally{db.close();}
   return {completed:samples.length,stop,samples,recoveryMs:performance.now()-t,elapsedMs:performance.now()-start,mode:after.mode,checkpointBytes,databaseBytes:statSync(job.path).size,rssMiB:process.resourceUsage().maxRSS/1024,
    digest:createHash('sha256').update(canonical({snapshot:after,tables})).digest('hex'),node:process.version,sqlite:process.versions.sqlite};
  }finally{resumed.close();}
 }finally{d.close();}
}
function bootstrap(baseline=false):string {return `const fs=require('fs'),path=require('path'),cp=require('child_process'),ts=require('typescript');const changed=new Set(['src/persistence/schema.ts','src/persistence/sqlite-store.ts','src/persistence/types.ts','src/persistence/recovery.ts','src/persistence/durable-execution.ts']);require.extensions['.ts']=(m,p)=>{const rel=path.relative(process.cwd(),p).split(path.sep).join('/'),source=${baseline}&&changed.has(rel)?cp.execFileSync('git',['show','429f3e5f9fc5fb1d1ee62fe4968cd0101334c3c4:'+rel],{encoding:'utf8'}):fs.readFileSync(p,'utf8');m._compile(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,p);};const worker=require(path.resolve('test/persistence/storage-v2-perf-worker.ts'));const go=()=>{try{console.log(JSON.stringify(worker.runStorageJob(JSON.parse(process.env.STORAGE_JOB))));}catch(e){console.log(JSON.stringify({error:String(e)}));}finally{process.disconnect?.();}};if(process.send){process.send({ready:true});process.once('message',go);}else go();`;}
export function spawnStorageJob(job:StorageJob,baseline=false):any {
 const child=spawnSync(process.execPath,['--max-old-space-size=384','-e',bootstrap(baseline)],{cwd:process.cwd(),env:{...process.env,STORAGE_JOB:JSON.stringify(job)},timeout:60000,encoding:'utf8',windowsHide:true});
 if(child.error)throw child.error;
 if(child.status!==0)return {crashed:true,status:child.status,signal:child.signal,stderr:child.stderr};return JSON.parse(child.stdout);
}
export async function raceStorage(path:string,versions:(1|2)[]):Promise<any[]> {
 temporary(path);const base=new DatabaseSync(path);base.exec('PRAGMA journal_mode=WAL');base.close();const gate=path+'.gate';
 const children=versions.map(version=>fork('-e',[bootstrap()],{env:{...process.env,STORAGE_JOB:JSON.stringify({action:'init',path,version,gate})},execArgv:[],silent:true,windowsHide:true}));
 try{
  const done=children.map(child=>new Promise<unknown>((resolve,reject)=>{let output='';child.stdout!.on('data',chunk=>{output+=String(chunk);});child.on('error',reject);child.on('exit',code=>{try{if(code!==0)throw Error('Storage worker exited '+code);resolve(JSON.parse(output));}catch(e){reject(e);}});}));
  const ready=children.map(child=>new Promise<void>((resolve,reject)=>{child.on('error',reject);child.on('message',(m:any)=>{if(m.ready){child.send('GO');}if(m.inspected)resolve();});}));
  const timer=setTimeout(()=>{for(const child of children)child.kill('SIGKILL');},15000);
  try{await Promise.all(ready);writeFileSync(gate,'GO');return await Promise.all(done);}finally{clearTimeout(timer);}
 }finally{for(const child of children)if(child.exitCode===null)child.kill('SIGKILL');}
}

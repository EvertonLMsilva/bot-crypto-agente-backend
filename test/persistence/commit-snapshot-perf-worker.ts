/** Bounded diagnostic worker. Run in a fresh child, with all artifacts outside the repo. */
import { appendFileSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { RuntimeConfiguration, DurableExecution, canonical } from '../../src/persistence';
import { SimulationRuntime } from '../../src/runtime';
import { SimulationClock } from '../../src/simulation/clock';
import { SeededGenerator, CandleBatch } from '../../src/simulation/seeded-generator';
import { fixtureManifestHash } from '../../src/simulation/fixture-source';

export function performanceConfiguration(mode:'seeded'|'fixture',intervals=1802):RuntimeConfiguration {
 const startTime='2026-01-01T00:00:00.000Z';
 const policy=(asset:'BTC'|'ETH')=>({id:`${asset}-P0`,asset,version:'1',state:'UNVALIDATED' as const,families:(['TREND','BREAKOUT','MEAN_REVERSION'] as const).map(family=>({family,id:family,version:'1'}))});
 const provider={id:'seeded-generator' as const,version:'1' as const,seed:'perf-001',initialPrices:{BTC:'100.00000000',ETH:'100.00000000'}};
 const base={simulationId:'perf',startTime,initialCapital:'10000.00000000',policies:{BTC:policy('BTC'),ETH:policy('ETH')},context:{id:'context',version:'1',feed:{status:'VALID' as const,events:[]}},warmup:{hourlyCandles:150 as const}};
 if(mode==='seeded')return {...base,version:'1',provider};
 const generator=new SeededGenerator(new SimulationClock(startTime),provider),batches:CandleBatch[]=[];
 for(let i=0;i<intervals;i++)batches.push(generator.next());
 const body={version:'1' as const,id:'perf-1802',startTime,batches},hash=fixtureManifestHash(body),identity='fixture-market/1:'+hash;
 return {...base,version:'2',provider:{id:'fixture-market',version:'1',identity,seed:identity,initialPrices:provider.initialPrices,manifest:{...body,hash}}};
}
export interface PerformanceOptions {readonly dir:string;readonly mode:'seeded'|'fixture';readonly cycles:number;readonly timeMs:number;readonly rssMB:number;readonly databaseMB:number;readonly variant:string}
export function runPerformance(options:PerformanceOptions) {
 if(![2,4,16,32,64].includes(options.cycles) || options.timeMs>50000 || options.rssMB>512 || options.databaseMB>256)throw new RangeError('Unsafe diagnostic limits');
 const dir=resolve(options.dir);if(!dir.startsWith(resolve(tmpdir())+sep))throw new RangeError('Performance artifacts must be temporary and outside the repo');
 const path=join(dir,options.variant+'-'+options.mode+'-'+options.cycles+'.sqlite'),log=path+'.ndjson';
 const record=(value:unknown)=>appendFileSync(log,JSON.stringify(value)+'\n');
 const bytes=()=>[path,path+'-wal',path+'-shm'].reduce((n,p)=>n+(existsSync(p)?statSync(p).size:0),0);
 const now=()=>performance.now(),started=now(),config=performanceConfiguration(options.mode),d=new DurableExecution(path,{create:true,busyTimeoutMs:2000}),runtime=new SimulationRuntime(d);
 const samples:{n:number;ms:number;cpuMs:number;rssMB:number;peakRSSMB:number;heapMB:number;databaseBytes:number}[]=[];let stop:string|null=null;
 let finalDigest='',recoveryMs=0;
 record({kind:'limits',...options,node:process.version,sqlite:process.versions.sqlite,checkpoints:'after each cycle, supervisor enforces wall timeout'});
 try{
  runtime.create(config,{nextTieAsset:'BTC'});runtime.start();let revision='0';
  for(let i=0;i<options.cycles;i++){
   if(now()-started>=options.timeMs){stop='TIME_LIMIT';break;}
   const t=now(),cpu=process.cpuUsage(),snapshot=runtime.advanceCycle(revision),usage=process.cpuUsage(cpu);revision=snapshot.confirmed.control.revision;
   const sample={n:i+1,ms:now()-t,cpuMs:(usage.user+usage.system)/1000,rssMB:process.memoryUsage().rss/1048576,peakRSSMB:process.resourceUsage().maxRSS/1024,heapMB:process.memoryUsage().heapUsed/1048576,databaseBytes:bytes()};samples.push(sample);record({kind:'cycle',...sample});
   if(sample.heapMB>384){stop='HEAP_LIMIT';break;}if(sample.peakRSSMB>options.rssMB){stop='MEMORY_LIMIT';break;}if(sample.databaseBytes>options.databaseMB*1048576){stop='DATABASE_LIMIT';break;}
  }
  const before=runtime.snapshot().confirmed;runtime.pause();runtime.close();
  const next=new DurableExecution(path,{create:false,busyTimeoutMs:2000}),resumed=new SimulationRuntime(next);
  try{
   const t=now(),after=resumed.resume(config.simulationId);recoveryMs=now()-t;
   if(canonical(after.confirmed.state)!==canonical(before.state)||after.mode!=='PAUSED')throw new Error('Performance recovery diverged');
   // Native read here is diagnostic only; normal recovery already verified the full ledger.
   const db=(next as unknown as {store:{db:import('node:sqlite').DatabaseSync}}).store.db;
   const data=Object.fromEntries(['simulations','operations','events','postings','checkpoints','runtime_control'].map(table=>{
    const statement=db.prepare('SELECT * FROM '+table);statement.setReadBigInts(true);
    return [table,statement.all().map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,String(v)])))];
   }));
   finalDigest=createHash('sha256').update(canonical({snapshot:after,data})).digest('hex');
  }finally{resumed.close();}
 }finally{runtime.close();}
 const result={...options,completed:samples.length,stop,samples,recoveryMs,finalDigest,peakRSSMB:process.resourceUsage().maxRSS/1024,databaseBytes:bytes(),elapsedMs:now()-started,node:process.version,sqlite:process.versions.sqlite};
 record({kind:'result',...result});return result;
}

/** Reproduce paired runs in separate processes; baseline code is read from Git, never checked out. */
export function spawnPerformance(options:PerformanceOptions,baseline:boolean):ReturnType<typeof runPerformance> {
 const bootstrap=`const fs=require('fs'),path=require('path'),cp=require('child_process'),ts=require(path.join(process.cwd(),'node_modules/typescript'));
 const changed=new Set(['src/runtime/runtime.ts','src/persistence/durable-execution.ts','src/persistence/runtime-evidence.ts','src/persistence/types.ts']);
 require.extensions['.ts']=(m,p)=>{const rel=path.relative(process.cwd(),p).split(path.sep).join('/'),text=${baseline}&&changed.has(rel)?cp.execFileSync('git',['show','e9047e482ff6bdcbbb9daf5216f955afe039cc63:'+rel],{encoding:'utf8'}):fs.readFileSync(p,'utf8');
 m._compile(ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,p);};
 console.log(JSON.stringify(require(path.resolve('test/persistence/commit-snapshot-perf-worker.ts')).runPerformance(JSON.parse(process.env.PERF_OPTIONS))));`;
 const child=spawnSync(process.execPath,['--max-old-space-size=384','-e',bootstrap],{cwd:process.cwd(),env:{...process.env,PERF_OPTIONS:JSON.stringify(options)},
  timeout:60000,encoding:'utf8',windowsHide:true});
 if(child.error || child.status!==0)throw new Error('Performance child failed: '+(child.error?.message??child.stderr));
 return JSON.parse(child.stdout) as ReturnType<typeof runPerformance>;
}
/** Independent financial oracle, with nonempty holds, cancellation and a losing gap.
 * Legacy D5 module test: no runtime warmup shortcut. */
export function runFinancialEquivalence(path:string) {
 const h=require('./crash-worker') as typeof import('./crash-worker');
 const { authorizeEntryBatch,createAuthorizationState }=require('../../src/budget') as typeof import('../../src/budget');
 const { coordinateEntryBatch }=require('../../src/coordination') as typeof import('../../src/coordination');
 const d=new DurableExecution(path,{create:true,busyTimeoutMs:2000});h.genesis(d);
 try{
  const snapshots:unknown[]=[],receipts:unknown[]=[];
  function write(command:import('../../src/operations').ExecutionCommand,op:string,extra:Record<string,unknown>={}) {
   const before=d.loadState('sim'),input={simulationId:'sim',operationId:op,expectedRevision:before.control.revision,payload:h.payload(command,extra)};
   const receipt=d.commitOperation(input);receipts.push(receipt);const loaded=d.loadState('sim');snapshots.push(loaded);return loaded;
  }
  const a=write(h.authorizationCommand(),'authorize'),reservation=a.state.reservations[0]!.source.id;
  const cancel={kind:'CANCEL' as const,id:JSON.stringify(['CANCEL',reservation]),asOf:h.at,reservationId:reservation,reason:'OPERATOR_CANCEL'};
  write(cancel,'cancel');write(h.openingCommand(),'open');
  const end='2026-01-01T01:05:00.000Z';
  const closed=write({id:JSON.stringify(['CLOSE',end]),kind:'CLOSE',asOf:end,candles:(['BTC','ETH'] as const).map(asset=>({asset,openTime:h.at,closeTime:end,open:'100.00000000',high:'101.00000000',low:'99.00000000',close:'100.00000000',volume:'1.00000000'}))},'close');
  const coordinator=coordinateEntryBatch([],end,closed.control.cursor.coordinatorState);
  const authorization=authorizeEntryBatch(coordinator,closed.state.portfolio,h.prices,createAuthorizationState(closed.state.portfolio),end);
  write({id:JSON.stringify(['AUTHORIZE',end]),kind:'AUTHORIZE',authorization},'authorize2',{coordinator});
  const final=write({kind:'OPEN',id:JSON.stringify(['OPEN',end]),asOf:end,openings:(['BTC','ETH'] as const).map(asset=>({asset,asOf:end,price:'90.00000000'})),exits:[]},'gap');
  const old=d.commitOperation({simulationId:'sim',operationId:'cancel',expectedRevision:'0',payload:h.payload(cancel)});
  if(canonical(old)!==canonical(receipts[1]) || !final.state.realizedPnl.startsWith('-'))throw Error('Invalid financial oracle');
  const recovered=d.recover('sim');if(canonical(recovered.state)!==canonical(final.state))throw Error('Financial recovery mismatch');
  const tables=Object.fromEntries(['simulations','operations','events','postings','checkpoints','runtime_control'].map(table=>[table,h.rows(path,table)]));
  const serialized=canonical({snapshots,receipts,final:recovered,tables});
  return {digest:createHash('sha256').update(serialized).digest('hex'),realizedPnl:final.state.realizedPnl,equity:final.state.portfolio.equity};
 }finally{d.close();}
}

/** A fresh process can commit between another writer's COMMIT and publication. */
export function snapshotWriter(path:string,command:'authorize'|'open',operationId:string,expectedRevision:string) {
 const h=require('./crash-worker') as typeof import('./crash-worker');
 const d=new DurableExecution(path,{create:false,busyTimeoutMs:2000});
 try{d.recover('sim');return d.commitOperationWithSnapshot({simulationId:'sim',operationId,expectedRevision,payload:h.payload(command==='open'?h.openingCommand():h.authorizationCommand())});}finally{d.close();}
}

export function spawnDiagnostic(action:'financial'|'writer',args:unknown[],baseline=false):any {
 const bootstrap=`const fs=require('fs'),path=require('path'),cp=require('child_process'),ts=require('typescript');
 const changed=new Set(['src/runtime/runtime.ts','src/persistence/durable-execution.ts','src/persistence/runtime-evidence.ts','src/persistence/types.ts']);
 require.extensions['.ts']=(m,p)=>{const rel=path.relative(process.cwd(),p).split(path.sep).join('/'),source=${baseline}&&changed.has(rel)?cp.execFileSync('git',['show','e9047e482ff6bdcbbb9daf5216f955afe039cc63:'+rel],{encoding:'utf8'}):fs.readFileSync(p,'utf8');m._compile(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,p);};
 const worker=require(path.resolve('test/persistence/commit-snapshot-perf-worker.ts')),a=JSON.parse(process.env.SNAPSHOT_ARGS);try{console.log(JSON.stringify(worker.${action==='financial'?'runFinancialEquivalence':'snapshotWriter'}(...a),(_,v)=>typeof v==='bigint'?String(v):v));}catch(e){console.log(JSON.stringify({error:String(e)}));}`;
 const child=spawnSync(process.execPath,['--max-old-space-size=384','-e',bootstrap],{cwd:process.cwd(),env:{...process.env,SNAPSHOT_ARGS:JSON.stringify(args)},timeout:20000,encoding:'utf8',windowsHide:true});
 if(child.error || child.status!==0)throw Error('Diagnostic child failed: '+(child.error?.message??child.stderr));return JSON.parse(child.stdout);
}

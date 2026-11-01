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
 const dir=resolve(options.dir);if(!dir.startsWith(resolve(tmpdir())+sep))throw new RangeError('Performance artifacts must be temporary and outside the repo');
 const path=join(dir,options.variant+'-'+options.mode+'-'+options.cycles+'.sqlite'),log=path+'.ndjson';
 const record=(value:unknown)=>appendFileSync(log,JSON.stringify(value)+'\n');
 const bytes=()=>[path,path+'-wal',path+'-shm'].reduce((n,p)=>n+(existsSync(p)?statSync(p).size:0),0);
 const now=()=>performance.now(),started=now(),config=performanceConfiguration(options.mode),d=new DurableExecution(path,{create:true,busyTimeoutMs:2000}),runtime=new SimulationRuntime(d);
 const samples:{n:number;ms:number;cpuMs:number;rssMB:number;peakRSSMB:number;databaseBytes:number}[]=[];let stop:string|null=null;
 let finalDigest='',recoveryMs=0;
 record({kind:'limits',...options,node:process.version,sqlite:process.versions.sqlite,checkpoints:'after each cycle, supervisor enforces wall timeout'});
 try{
  runtime.create(config,{nextTieAsset:'BTC'});runtime.start();let revision='0';
  for(let i=0;i<options.cycles;i++){
   if(now()-started>=options.timeMs){stop='TIME_LIMIT';break;}
   const t=now(),cpu=process.cpuUsage(),snapshot=runtime.advanceCycle(revision),usage=process.cpuUsage(cpu);revision=snapshot.confirmed.control.revision;
   const sample={n:i+1,ms:now()-t,cpuMs:(usage.user+usage.system)/1000,rssMB:process.memoryUsage().rss/1048576,peakRSSMB:process.resourceUsage().maxRSS/1024,databaseBytes:bytes()};samples.push(sample);record({kind:'cycle',...sample});
   if(sample.peakRSSMB>options.rssMB){stop='MEMORY_LIMIT';break;}if(sample.databaseBytes>options.databaseMB*1048576){stop='DATABASE_LIMIT';break;}
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
 const changed=new Set(['src/persistence/recovery.ts','src/persistence/runtime-evidence.ts','src/persistence/sqlite-store.ts','src/operations/execution.ts']);
 require.extensions['.ts']=(m,p)=>{const rel=path.relative(process.cwd(),p).split(path.sep).join('/'),text=${baseline}&&changed.has(rel)?cp.execFileSync('git',['show','3c8021b45ac237bb953463c0d47811a5ca4b2b13:'+rel],{encoding:'utf8'}):fs.readFileSync(p,'utf8');
 m._compile(ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,p);};
 console.log(JSON.stringify(require(path.resolve('test/persistence/replay-perf-worker.ts')).runPerformance(JSON.parse(process.env.PERF_OPTIONS))));`;
 const child=spawnSync(process.execPath,['--max-old-space-size=384','-e',bootstrap],{cwd:process.cwd(),env:{...process.env,PERF_OPTIONS:JSON.stringify(options)},
  timeout:options.timeMs+3000,encoding:'utf8',windowsHide:true});
 if(child.error || child.status!==0)throw new Error('Performance child failed: '+(child.error?.message??child.stderr));
 return JSON.parse(child.stdout) as ReturnType<typeof runPerformance>;
}

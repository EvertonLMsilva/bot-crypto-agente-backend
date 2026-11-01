import { DurableExecution, canonical } from '../../src/persistence';
import { BudgetSnapshot, ClosedPriceReference, authorizeEntryBatch, createAuthorizationState } from '../../src/budget';
import { coordinateEntryBatch, CoordinationResult } from '../../src/coordination';
import { DecisionEnvelope } from '../../src/operations/types';
import { SignalAssessment } from '../../src/signals/types';
import { ExecutionCommand } from '../../src/operations';
import { fork, spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
export const configuration={engineVersion:'D4-472bc0a5-D5-cancel-v1',coordinatorState:{nextTieAsset:'BTC' as const},clock:{startTime:'2026-01-01T01:00:00.000Z',currentTime:'2026-01-01T01:00:00.000Z',steps:0},generator:{version:'1',seed:'d5-test',confirmedSteps:0}};
const dirs:string[]=[],stores:DurableExecution[]=[];
export function temp(){const dir=mkdtempSync(join(tmpdir(),'bot-d5-'));dirs.push(dir);return join(dir,'financial.sqlite');}
export function open(path=temp(),create=true, fault?: (point:string)=>void){const d=new DurableExecution(path,{create,busyTimeoutMs:2000,...(fault?{fault}:{})});stores.push(d);return d;}
export function cleanup(){for(const d of stores.splice(0))d.close();for(const dir of dirs.splice(0)){if(!resolve(dir).startsWith(resolve(tmpdir())+sep))throw Error('Unsafe temp path');rmSync(dir,{recursive:true,force:true});}}
export const at='2026-01-01T01:00:00.000Z';
export function batch(asset:'BTC'|'ETH'='BTC',asOf=at):CoordinationResult{
  const q=(n:number)=>({numerator:String(n),denominator:'1'}),policyId=`${asset}-P0`;
  const assessments:SignalAssessment[]=(['TREND','BREAKOUT','MEAN_REVERSION'] as const).map(family=>{
    const qualified=family==='MEAN_REVERSION';
    return {family,G:qualified?1:0,F:q(qualified?1:0),Q:q(1),V:q(1),T:q(qualified?100:30),reasons:[qualified?'QUALIFIED':'TECHNICAL:REGIME_INCOMPATIBLE'],
      id:JSON.stringify([asset,asOf,policyId,'1',family,'1']),asset,closeTime:asOf,policyId,policyVersion:'1',familyId:family,familyVersion:'1',
      technicalEligible:qualified,technicalReason:qualified?'TECHNICALLY_ELIGIBLE':'REGIME_INCOMPATIBLE',TApproximate:qualified?100:30,
      R:qualified?100:null,C:q(100),H:0,A:qualified?50:null,agreementParticipant:false,scoreRaw:qualified?q(80):null,scoreRounded:qualified?80:null,qualified};
  });
  const candidate=assessments[2]!,id=JSON.stringify([asset,asOf,policyId,'1',candidate.familyId,'1','ENTRY_CANDIDATE']);
  const position={asset,asOf,status:'FLAT' as const},reasons=['QUALIFIED_REPRESENTATIVE' as const];
  const decision:DecisionEnvelope={id,asset,asOf,policyId,policyVersion:'1',type:'ENTRY_CANDIDATE',position,reasons,exitEvaluation:'NOT_APPLICABLE',candidate,
    validity:'NEXT_ELIGIBLE_OPEN_ONLY',financialAuthorization:'NOT_EVALUATED',execution:'NOT_EXECUTED',audit:{decisionId:id,asset,asOf,policyId,policyVersion:'1',type:'ENTRY_CANDIDATE',
      position,reasons,exitEvaluation:'NOT_APPLICABLE',selection:{asset,asOf,policyId,policyVersion:'1',context:{status:'VALID',C:q(100),U:0,groups:[],reason:'VALID_FEED'},
        assessments,representative:candidate,discarded:assessments.slice(0,2).map(assessment=>({assessment,reason:'NOT_QUALIFIED'}))}}};
  return coordinateEntryBatch([decision],asOf,{nextTieAsset:'BTC'});
}
export function portfolio():BudgetSnapshot{return {asOf:at,state:'RUNNING',equity:'10000.00000000',dayOpeningEquity:'10000.00000000',availableCash:'10000.00000000',
  reservedCash:'0.00000000',committedExposure:{BTC:'0.00000000',ETH:'0.00000000'},committedRisk:'0.00000000',positions:{BTC:'FLAT',ETH:'FLAT'},reservations:{BTC:'NONE',ETH:'NONE'}};}
export const price:ClosedPriceReference={asset:'BTC',closeTime:at,close:'100.00000000',validatedClosed:true};
export const prices = { BTC: price, ETH: {...price,asset:'ETH' as const} };
export function both(){return coordinateEntryBatch([...batch('ETH').opportunities,...batch().opportunities],at,{nextTieAsset:'BTC'});}

export function genesis(d:DurableExecution,initial=portfolio(),simulationId='sim'){return d.createSimulation({simulationId,operationId:'genesis',initial,configuration});}
export function authorizationCommand():ExecutionCommand{const p=portfolio();return {id:JSON.stringify(['AUTHORIZE',at]),kind:'AUTHORIZE',authorization:authorizeEntryBatch(both(),p,prices,createAuthorizationState(p),at)};}
export function openingCommand():ExecutionCommand{return {id:JSON.stringify(['OPEN',at]),kind:'OPEN',asOf:at,openings:[{asset:'BTC',asOf:at,price:'100.00000000'},{asset:'ETH',asOf:at,price:'100.00000000'}],exits:[]};}
export function payload(command:ExecutionCommand,overrides:Record<string,unknown>={}){
 const asOf=command.kind==='AUTHORIZE'?command.authorization.state.asOf:command.asOf;
 const steps=(Date.parse(asOf)-Date.parse(configuration.clock.startTime))/300000;
 const coordinator=command.kind==='AUTHORIZE'?coordinateEntryBatch(command.authorization.decisions.map(d=>JSON.parse(d.request)[0] as DecisionEnvelope),asOf,{nextTieAsset:'BTC'}):null;
 return canonical({command,evidence:{coordinator,clock:{...configuration.clock,currentTime:asOf,steps},generator:{...configuration.generator,confirmedSteps:steps},...overrides}});
}
export function commit(d:DurableExecution,command=authorizationCommand(),operationId='authorize',expectedRevision='0'){return d.commitOperation({simulationId:'sim',operationId,expectedRevision,payload:payload(command)});}
export function raw(path:string,fn:(db:DatabaseSync)=>void){const db=new DatabaseSync(path);try{fn(db);}finally{db.close();}}
export function rows(path:string,table:string){let result:Record<string,unknown>[]=[];raw(path,db=>{result=db.prepare(`SELECT * FROM ${table}`).all();});return result;}
function bootstrap(){return `const fs=require('fs'),ts=require('typescript');require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,p);require(${JSON.stringify(__filename)});`;}
export function crash(path:string,mode:string){return spawnSync(process.execPath,['-e',bootstrap(),'--',mode,path],{env:{...process.env,D5_WORKER:'1'},timeout:20000,encoding:'utf8',windowsHide:true});}
export function concurrent(path:string,operationId:string,commandKind='authorize'){
 const child=fork('-e',[bootstrap(),'--','concurrent',path,operationId,commandKind],{env:{...process.env,D5_WORKER:'1'},execArgv:[],silent:true,windowsHide:true});
 return child;
}
if(process.env.D5_WORKER==='1'){
 const mode=process.argv[1]!,path=process.argv[2]!;
 const d=new DurableExecution(path,{create:false,busyTimeoutMs:2000,fault:point=>{
  if(mode==='crash-before' && point==='before-commit' || mode==='crash-after' && point==='after-commit')process.kill(process.pid,'SIGKILL');
 }});
 d.recover('sim');
 if(mode==='concurrent'){
  process.send!({ready:true});process.on('message',()=>{try{const isOpen=process.argv[4]==='open';process.send!({receipt:commit(d,isOpen?openingCommand():authorizationCommand(),process.argv[3]!,isOpen?'1':'0')});}
   catch(e){process.send!({error:String(e)});}finally{d.close();process.disconnect();}});
 }else{commit(d,openingCommand(),'open','1');d.close();}
}

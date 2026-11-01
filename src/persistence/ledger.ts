import { createHash } from 'node:crypto';
import { immutable, same } from '../budget/reservations';
import { parseFixed8 } from '../budget';
import { parseSigned, signed } from '../operations/execution-accounting';
import { createExecutionState, acceptAuthorizations, cancelActiveReservation, processOpening, processClosedCandle, validateExecutionState, ExecutionState, ExecutionCommand } from '../operations';
import { budgetCycleTime, requireBudget } from '../budget/limits';
import { Configuration, Cursor, ENGINE_VERSION, GenesisInput, LedgerEvent, OperationPayload, Posting, Receipt } from './types';
export { immutable, same, requireBudget };
export const ZERO_HASH = '0'.repeat(64);
export const canonical = (v: unknown): string => JSON.stringify(immutable(v));
export const hash = (v: unknown): string => createHash('sha256').update(canonical(v)).digest('hex');
export function identifier(v: string): void {requireBudget(typeof v==='string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(v),'Explicit stable identifier required');}
export function revision(v: string): bigint {requireBudget(typeof v==='string' && /^(0|[1-9]\d*)$/.test(v) && BigInt(v)<=9223372036854775807n,'Canonical database revision required');return BigInt(v);}
export function parseCanonical<T>(v: string): T {
  let parsed: T;try{parsed=JSON.parse(v) as T;}catch{throw new RangeError('Invalid canonical JSON');}
  requireBudget(canonical(parsed)===v,'Noncanonical JSON');return parsed;
}
function clock(c: Configuration['clock'], asOf: string): void {
  requireBudget(c && budgetCycleTime(c.startTime)===c.startTime && budgetCycleTime(c.currentTime)===asOf
    && Number.isSafeInteger(c.steps) && c.steps>=0 && Date.parse(asOf)-Date.parse(c.startTime)===c.steps*300000,'Invalid confirmed logical clock');
}
export function genesisState(input: GenesisInput): {state:ExecutionState;cursor:Cursor} {
  identifier(input.simulationId);identifier(input.operationId);
  const state=createExecutionState(input.initial),c=input.configuration;
  requireBudget(c && c.engineVersion===ENGINE_VERSION && ['BTC','ETH'].includes(c.coordinatorState.nextTieAsset)
    && c.generator && c.generator.version==='1' && typeof c.generator.seed==='string' && c.generator.seed.trim().length>0,'Explicit supported configuration/version required');
  clock(c.clock,state.asOf);requireBudget(c.generator.confirmedSteps===c.clock.steps,'Generator cursor mismatch');
  return {state,cursor:{asOf:state.asOf,phase:state.phase,authorizedAt:null,coordinatorState:c.coordinatorState,clock:c.clock,generator:c.generator}};
}
export function execute(s: ExecutionState, p: OperationPayload): ExecutionState {
  const c=p.command;requireBudget(c && typeof c==='object','D4 command required');
  let next:ExecutionState;
  if(c.kind==='AUTHORIZE')next=acceptAuthorizations(s,c.authorization);
  else if(c.kind==='OPEN')next=processOpening(s,c.openings,c.exits,c.asOf);
  else if(c.kind==='CLOSE')next=processClosedCandle(s,c.candles,c.asOf);
  else {requireBudget(c.kind==='CANCEL','Unsupported D4 command');next=cancelActiveReservation(s,c.reservationId,c.reason,c.asOf);}
  requireBudget(next.commands.length===s.commands.length+1 && same(next.commands.at(-1),c),'Command identity/payload already processed or noncanonical');
  return validateExecutionState(next);
}
export function advanceCursor(previous:Cursor,p:OperationPayload,after:ExecutionState):Cursor {
  const e=p.evidence,c=p.command;requireBudget(e && e.clock && e.generator,'Explicit recovery evidence required');
  clock(e.clock,after.asOf);
  requireBudget(e.clock.startTime===previous.clock.startTime && e.clock.steps>=previous.clock.steps
    && e.generator.seed===previous.generator.seed && e.generator.version===previous.generator.version
    && e.generator.confirmedSteps===e.clock.steps,'Divergent clock/generator origin');
  let coordinatorState=previous.coordinatorState,authorizedAt=previous.authorizedAt;
  if(c.kind==='AUTHORIZE'){
    const batch=e.coordinator;
    requireBudget(batch && batch.asOf===after.asOf && same(batch.audit.previousState,previous.coordinatorState)
      && same(batch.nextState,batch.audit.nextState) && ['BTC','ETH'].includes(batch.nextState.nextTieAsset)
      && batch.opportunities.length===c.authorization.decisions.length,'Missing/divergent D2 recovery evidence');
    batch.opportunities.forEach((d,i)=>{
      const r=c.authorization.decisions[i]!;
      requireBudget(r && r.request===canonical([d,r.quote.price,i+1,batch.audit.ranking[i]]),'D2/D3.2 evidence mismatch');
    });
    coordinatorState=batch.nextState;authorizedAt=after.asOf;
  }else{
    requireBudget(e.coordinator===null,'Unexpected coordinator update');
    if(c.kind==='OPEN')requireBudget(authorizedAt===after.asOf || after.asOf>previous.asOf,'Authorization phase not explicitly sealed');
    if(c.kind==='CLOSE')authorizedAt=null;
  }
  return {asOf:after.asOf,phase:after.phase,authorizedAt,coordinatorState,clock:e.clock,generator:e.generator};
}
function summary(s:ExecutionState){return {portfolio:s.portfolio,realizedPnl:s.realizedPnl,unrealizedPnl:s.unrealizedPnl,feesPaid:s.feesPaid,
  marks:s.marks,positions:s.positions,reservations:s.reservations,orders:s.orders};}
function market(s:ExecutionState|null):bigint{return s?parseFixed8(s.portfolio.committedExposure.BTC)+parseFixed8(s.portfolio.committedExposure.ETH)-parseFixed8(s.portfolio.reservedCash):0n;}
export function buildLedger(simulationId:string,operationId:string,rev:string,before:ExecutionState|null,after:ExecutionState,cursor:Cursor,
  headSeq:string,headHash:string,genesis?:GenesisInput):{events:LedgerEvent[];postings:Posting[];receipt:Receipt}{
  const source=genesis?[{kind:'GENESIS',payload:canonical(genesis)}]:after.events.slice(before!.events.length).map(event=>({kind:event.kind,payload:canonical(event)}));
  source.push({kind:'FINANCIAL_RECONCILIATION',payload:canonical({before:before?summary(before):null,after:summary(after),fills:after.fills.slice(before?.fills.length??0)})});
  const events:LedgerEvent[]=[];let seq=BigInt(headSeq),previousHash=headHash;
  for(const [i,item] of source.entries()){
    const body={seq:String(++seq),eventId:canonical([simulationId,operationId,i+1]),operationId,ordinal:String(i+1),kind:item.kind,
      asOf:after.asOf,phase:after.phase,payload:item.payload,previousHash};
    const event={...body,hash:hash({schemaVersion:1,simulationId,...body})};events.push(event);previousHash=event.hash;
  }
  const delta=(field:'availableCash'|'reservedCash')=>parseFixed8(after.portfolio[field])-(before?parseFixed8(before.portfolio[field]):0n);
  const amounts:[string,bigint][]=[['CASH_AVAILABLE',delta('availableCash')],['CASH_RESERVED',delta('reservedCash')],['POSITIONS_MARKED',market(after)-market(before)]];
  if(genesis)amounts.push(['CAPITAL_ORIGIN',-parseFixed8(after.portfolio.equity)]);
  else amounts.push(['REALIZED_PNL',-(parseSigned(after.realizedPnl)-parseSigned(before!.realizedPnl))],
    ['UNREALIZED_PNL',-(parseSigned(after.unrealizedPnl)-parseSigned(before!.unrealizedPnl))]);
  requireBudget(amounts.reduce((n,[,v])=>n+v,0n)===0n,'Unbalanced financial postings');
  const postings=amounts.filter(([,v])=>v!==0n).map(([account,value],i)=>({eventSeq:String(seq),ordinal:String(i+1),account,amount:signed(value)}));
  const receipt:Receipt={simulationId,operationId,revision:rev,seqStart:events[0]!.seq,seqEnd:String(seq),stateHash:hash(after),cursor,
    fillIds:after.fills.slice(before?.fills.length??0).map(f=>f.id),reservationIds:after.reservations.slice(before?.reservations.length??0).map(r=>r.source.id)};
  return {events,postings,receipt};
}

import { Asset, Candle } from '../simulation/candle';
import { parseFixed8, formatFixed8 } from '../budget';
import { budgetCycleTime, requireBudget } from '../budget/limits';
import { immutable } from '../budget/reservations';
import { ExecutedPosition, ExecutionState, ExitRequest, createExitRequest } from '../operations';
import { DecisionEnvelope } from '../operations/types';
import { TechnicalFamily } from '../strategies';

export interface ExitOrigin {
  readonly positionId:string; readonly decisionId:string; readonly strategyId:string; readonly strategyVersion:string;
  readonly signalAsOf:string; readonly family:TechnicalFamily; readonly breakoutLevel:string|null;
}
function closedHistory(candles:readonly Candle[],asset:Asset,asOf:string):void {
  const time=budgetCycleTime(asOf);let previous:string|null=null;
  requireBudget(candles.length>0,'Strategic origin history absent');
  for(const c of candles){
    requireBudget(c.asset===asset && budgetCycleTime(c.openTime)===c.openTime && budgetCycleTime(c.closeTime)===c.closeTime
      && Date.parse(c.closeTime)-Date.parse(c.openTime)===300000 && c.closeTime<=time
      && (previous===null || c.openTime===previous),'Invalid/future strategic history');
    const o=parseFixed8(c.open),h=parseFixed8(c.high),l=parseFixed8(c.low),v=parseFixed8(c.close);parseFixed8(c.volume);
    requireBudget(l>0n && l<=o && l<=v && h>=o && h>=v && h>=l,'Invalid strategic OHLCV');previous=c.closeTime;
  }
  requireBudget(previous===time,'Strategic history must end at current closed frontier');
}
function originalLevel(history:readonly Candle[],signalAsOf:string):bigint {
  const index=history.findIndex(c=>c.closeTime===signalAsOf);
  requireBudget(index>=20,'Breakout origin requires 20 previous closed bars');
  return history.slice(index-20,index).reduce((max,c)=>{const high=parseFixed8(c.high);return high>max?high:max;},0n);
}
/** Exact approved EMA21/SMA20 comparisons, independent of financial rounding. */
export function strategicExit(position:ExecutedPosition,origin:ExitOrigin,history:readonly Candle[],asOf:string):ExitRequest|null {
  requireBudget(position.status==='OPEN' && origin.positionId===position.id && origin.decisionId===position.decisionId
    && origin.strategyId===position.strategyId && origin.strategyVersion===position.strategyVersion
    && origin.signalAsOf===position.openedAt,'Invalid strategic origin/position');
  closedHistory(history,position.asset,asOf);
  requireBudget(history.some(c=>c.closeTime===origin.signalAsOf),'Strategic origin candle absent');
  const latest=history.at(-1)!;
  if(asOf<=position.openedAt)return null;
  let triggered=false;
  if(origin.family==='BREAKOUT'){
    requireBudget(origin.breakoutLevel!==null && parseFixed8(origin.breakoutLevel)===originalLevel(history,origin.signalAsOf),'Missing/divergent frozen breakout origin level');
    triggered=history.length>=2 && history.slice(-2).every(c=>c.closeTime>position.openedAt && parseFixed8(c.close)<parseFixed8(origin.breakoutLevel!));
  }else if(origin.family==='MEAN_REVERSION'){
    if(history.length>=20){const sum=history.slice(-20).reduce((n,c)=>n+parseFixed8(c.close),0n);triggered=20n*parseFixed8(latest.close)>=sum;}
  }else{
    requireBudget(origin.family==='TREND','Unsupported strategic origin family');
    let n=0n,d=21n;const below:boolean[]=[];
    for(const [i,c] of history.entries()){
      const price=parseFixed8(c.close);
      if(i<21)n+=price;else {n=10n*n+price*d;d*=11n;}
      below.push(i>=20 && c.closeTime>position.openedAt && price*d<n);
    }
    triggered=below.length>=2 && below.at(-1)===true && below.at(-2)===true;
  }
  return triggered?createExitRequest(position,asOf):null;
}

/** Reconstruct frozen evidence from immutable D3 origin and confirmed market prefix. */
export function evaluateStrategicExits(state:ExecutionState,history:Readonly<Record<Asset,readonly Candle[]>>,asOf:string):readonly ExitRequest[] {
  const exits:ExitRequest[]=[];
  for(const position of state.positions.filter(p=>p.status==='OPEN')){
    const reservation=state.reservations.find(r=>r.source.id===position.reservationId);
    const decision=state.origins.flatMap(o=>o.decisions).find(d=>d.decisionId===position.decisionId);
    requireBudget(reservation && reservation.status==='SETTLED' && reservation.source.decisionId===position.decisionId && decision
      && decision.status==='AUTHORIZED' && decision.reservationId===position.reservationId,'Strategic origin evidence missing');
    const original=JSON.parse(decision.request)[0] as DecisionEnvelope,candidate=original.candidate;
    requireBudget(original.type==='ENTRY_CANDIDATE' && original.id===position.decisionId && original.asset===position.asset && candidate
      && candidate.familyId===position.strategyId && candidate.familyVersion===position.strategyVersion
      && decision.quote.signalAsOf===position.openedAt,'Strategic origin identity/version mismatch');
    const bars=history[position.asset];closedHistory(bars,position.asset,asOf);
    const origin:ExitOrigin={positionId:position.id,decisionId:position.decisionId,strategyId:position.strategyId,strategyVersion:position.strategyVersion,
      family:candidate.family,signalAsOf:decision.quote.signalAsOf,breakoutLevel:candidate.family==='BREAKOUT'?formatFixed8(originalLevel(bars,decision.quote.signalAsOf)):null};
    if(candidate.family==='BREAKOUT'){
      const index=bars.findIndex(c=>c.closeTime===origin.signalAsOf),signal=bars[index]!,volume=bars.slice(index-20,index).reduce((n,c)=>n+parseFixed8(c.volume),0n);
      requireBudget(parseFixed8(signal.close)>parseFixed8(origin.breakoutLevel!) && volume>0n && 50n*parseFixed8(signal.volume)>3n*volume,'Breakout origin trigger is not evidenced');
    }
    const request=strategicExit(position,origin,bars,asOf);if(request)exits.push(request);
  }
  return immutable(exits.sort((a,b)=>a.id<b.id?-1:1));
}

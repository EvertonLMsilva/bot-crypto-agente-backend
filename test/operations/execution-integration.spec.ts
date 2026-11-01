import { createExecutionState, acceptAuthorizations, processOpening, processClosedCandle, validateExecutionState, createExitRequest, projectExecutionBudget } from '../../src/operations';
import { createAuthorizationState, authorizeEntryBatch } from '../../src/budget';
import { BudgetSnapshot, ClosedPriceReference } from '../../src/budget/types';
import { coordinateEntryBatch, CoordinationResult } from '../../src/coordination';
import { DecisionEnvelope } from '../../src/operations/types';
import { SignalAssessment } from '../../src/signals/types';
import { cancelActiveReservation } from '../../src/operations';
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
function reserved(b=batch(), p=portfolio()) { const s=createExecutionState(p);return acceptAuthorizations(s,authorizeEntryBatch(b,p,prices,createAuthorizationState(p),p.asOf)); }
function openings(time=at,btc='100.00000000',eth='100.00000000'){return [{asset:'BTC' as const,asOf:time,price:btc},{asset:'ETH' as const,asOf:time,price:eth}];}
const next='2026-01-01T01:05:00.000Z';
function candles(close='100.00000000',high='101.00000000',low='99.00000000',start=at,end=next){return (['BTC','ETH'] as const).map(asset=>({asset,openTime:start,closeTime:end,open:'100.00000000',high,low,close,volume:'1.00000000'}));}
test('D4 BTC/ETH share funds and replay does not settle twice',()=>{
 const s=reserved(both()),r=processOpening(s,openings(),[],at);
 expect(r.positions).toHaveLength(2);expect(r.portfolio.availableCash).toBe('7996.99900000');expect(processOpening(r,openings(),[],at)).toEqual(r);
 expect(validateExecutionState(r)).toEqual(r);
});
test('multicycle projection preserves identities and permits independent ETH entry',()=>{
 const s=processClosedCandle(processOpening(reserved(),openings(),[],at),candles(),next),p=projectExecutionBudget(s);
 const refs={BTC:{...price,closeTime:next},ETH:{...prices.ETH,closeTime:next}};
 const proof=authorizeEntryBatch(batch('ETH',next),p,refs,createAuthorizationState(p),next),out=processOpening(acceptAuthorizations(s,proof),openings(next),[],next);
 expect(out.positions.map(v=>v.asset)).toEqual(['BTC','ETH']);expect(out.origins).toHaveLength(2);
 expect(out.origins[0]!.decisions[0]!.decisionId).toBe(batch().opportunities[0]!.id);
 expect(out.origins[0]!.reservations[0]!.status).toBe('ACTIVE');expect(out.reservations[0]!.status).toBe('SETTLED');expect(acceptAuthorizations(out,proof)).toEqual(out);
});
test('deterministic immutable JSON without clock/randomness or mutation',()=>{
 const s=reserved(both()),data=openings(),before=JSON.stringify({s,data});
 jest.spyOn(Date,'now').mockImplementation(()=>{throw Error('clock');});jest.spyOn(Math,'random').mockImplementation(()=>{throw Error('random');});
 try{const r=processOpening(s,data,[],at);expect(processOpening(s,[...data].reverse(),[],at)).toEqual(r);
 expect(JSON.parse(JSON.stringify(r))).toEqual(r);expect(JSON.stringify({s,data})).toBe(before);
 const frozen=(v:unknown):void=>{if(v&&typeof v==='object'){expect(Object.isFrozen(v)).toBe(true);Object.values(v).forEach(frozen);}};frozen(r);
 expect(Object.isFrozen(data)).toBe(false);data[0]!.price='1.00000000';expect(r.marks.BTC).toBe('100.00000000');
 }finally{jest.restoreAllMocks();}
});
test.each([{low:'101.00000000'},{high:'99.00000000'},{volume:'-1.00000000'},{close:'NaN'},
 {closeTime:'2026-01-01T01:10:00.000Z'},{openTime:next},{open:'99.00000000'},{asset:'SOL'}])('invalid/future candle %j rejects',patch=>{
 const s=processOpening(reserved(),openings(),[],at),data=candles();Object.assign(data[0]!,patch);expect(()=>processClosedCandle(s,data,next)).toThrow(RangeError);
});
test('duplicate candle, divergent replay and corrupt journal reject',()=>{
 const s=processOpening(reserved(),openings(),[],at),data=candles();expect(()=>processClosedCandle(s,[data[0]!,data[0]!],next)).toThrow(RangeError);
 const r=processClosedCandle(s,data,next);expect(()=>processClosedCandle(r,candles('100.00000001'),next)).toThrow(RangeError);
 expect(()=>validateExecutionState(null as unknown as typeof s)).toThrow(RangeError);
 const bad=structuredClone(s);Object.assign(bad.commands[0]!,{id:'wrong'});expect(()=>validateExecutionState(bad)).toThrow(RangeError);
});
test('strategic BTC exit precedes the independent ETH buy at the same opening',()=>{
 const s=processClosedCandle(processOpening(reserved(),openings(),[],at),candles(),next),p=projectExecutionBudget(s);
 const refs={BTC:{...price,closeTime:next},ETH:{...prices.ETH,closeTime:next}},proof=authorizeEntryBatch(batch('ETH',next),p,refs,createAuthorizationState(p),next);
 const r=processOpening(acceptAuthorizations(s,proof),openings(next),[createExitRequest(s.positions[0]!,next)],next);
 expect(r.fills.slice(1).map(f=>[f.asset,f.side])).toEqual([['BTC','SELL'],['ETH','BUY']]);
 expect(r.positions.map(p=>p.status)).toEqual(['CLOSED','OPEN']);
});
test('signed positive profit is reconciled without changing frozen protections',()=>{
 const s=processOpening(reserved(),openings(),[],at),r=processClosedCandle(s,candles('104.00000000','105.00000000','99.00000000'),next);
 expect(r.realizedPnl.startsWith('-')).toBe(false);expect(r.positions[0]!.stop).toEqual(s.positions[0]!.stop);expect(r.positions[0]!.take).toEqual(s.positions[0]!.take);
 expect(r.realizedPnl).toBe('37.45924026');expect(r.portfolio.equity).toBe('10037.45924026');
});
test('explicit cancellation is terminal, audited and releases exactly once without advancing time',()=>{
 const s=reserved(),id=s.reservations[0]!.source.id,r=cancelActiveReservation(s,id,'ENTRY_SUSPENDED',at);
 expect(r.portfolio.availableCash).toBe('10000.00000000');expect(r.reservations[0]!.status).toBe('RELEASED');expect(r.asOf).toBe(at);
 expect(cancelActiveReservation(r,id,'ENTRY_SUSPENDED',at)).toEqual(r);
 expect(()=>cancelActiveReservation(r,id,'OTHER_REASON',at)).toThrow(RangeError);
 const filled=processOpening(s,openings(),[],at);expect(()=>cancelActiveReservation(filled,id,'ENTRY_SUSPENDED',at)).toThrow(RangeError);
 expect(()=>cancelActiveReservation(s,id,'ENTRY_SUSPENDED',next)).toThrow(RangeError);
});

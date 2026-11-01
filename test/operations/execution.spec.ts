import { createExecutionState, acceptAuthorizations, processOpening, processClosedCandle, validateExecutionState, createExitRequest, projectExecutionBudget } from '../../src/operations';
import { createAuthorizationState, authorizeEntryBatch } from '../../src/budget';
import { BudgetSnapshot, ClosedPriceReference } from '../../src/budget/types';
import { coordinateEntryBatch, CoordinationResult } from '../../src/coordination';
import { DecisionEnvelope } from '../../src/operations/types';
import { SignalAssessment } from '../../src/signals/types';
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
test('D4 independent reference: integral fill settles reserve and refunds exact excess',()=>{
 const s=reserved(),r=processOpening(s,openings(),[],at);
 expect(r.reservations[0]!.status).toBe('SETTLED');expect(r.positions[0]).toMatchObject({status:'OPEN',quantity:'10.00000000',entryPrice:'100.05000000',entryCost:'1001.50050000'});
 expect(r.portfolio).toMatchObject({availableCash:'8998.49950000',reservedCash:'0.00000000',equity:'9998.49950000'});
 expect(r.fills[0]).toMatchObject({side:'BUY',gross:'1000.50000000',fee:'1.00050000'});
 expect(s.reservations[0]!.status).toBe('ACTIVE');expect(s.portfolio.availableCash).toBe('8988.48449500');
});
test('cost exactly reserve settles; one tick excess cancels without resizing',()=>{
 const p={...portfolio(),equity:'10.00000000',dayOpeningEquity:'10.00000000',availableCash:'10.00000000'},s=reserved(batch(),p);
 const equal=processOpening(s,openings(at,'101.00000000'),[],at);expect(equal.reservations[0]!.status).toBe('SETTLED');
 expect(equal.fills[0]!.total).toBe(s.reservations[0]!.source.capital);expect(equal.positions[0]!.quantity).toBe('0.01000000');
 const over=processOpening(s,openings(at,'101.00000001'),[],at);expect(over.reservations[0]!.status).toBe('RELEASED');
 expect(over.events.at(-1)!.reason).toBe('RESERVE_EXCEEDED');expect(over.fills).toHaveLength(0);expect(over.portfolio.availableCash).toBe('10.00000000');
});
test('lost opening expires reservation without a retroactive fill',()=>{
 const r=processOpening(reserved(),openings(next),[],next);expect(r.reservations[0]!.status).toBe('RELEASED');
 expect(r.events.at(-1)!.reason).toBe('EXPIRED');expect(r.fills).toEqual([]);expect(r.portfolio.equity).toBe('10000.00000000');
 expect(processOpening(r,openings(next),[],next)).toEqual(r);
});
test.each([
 ['offset',()=>openings('2026-01-01T01:00:00+00:00')],['zero',()=>openings(at,'0.00000000')],['decimal',()=>openings(at,'100.0')],
 ['future',()=>[{...openings()[0]!,asOf:next},openings()[1]!]],['HLC',()=>[{...openings()[0]!,high:'105.00000000'},openings()[1]!]],
 ['duplicate',()=>[openings()[0]!,openings()[0]!]],['missing',()=>[openings()[0]!]]
])('invalid opening %s rejects',(_label,events)=>{expect(()=>processOpening(reserved(),events(),[],at)).toThrow(RangeError);});
test('divergent replay and out-of-order events fail',()=>{
 const s=reserved(),r=processOpening(s,openings(),[],at);
 expect(()=>processOpening(r,openings(at,'100.00000001'),[],at)).toThrow(RangeError);
 expect(()=>processOpening(s,openings('2026-01-01T00:55:00.000Z'),[],'2026-01-01T00:55:00.000Z')).toThrow(RangeError);
 expect(()=>processOpening(r,openings(next),[],next)).toThrow(RangeError);expect(()=>processClosedCandle(s,candles(),next)).toThrow(RangeError);
});
test('D3.2 proof must match wallet, remain intact and precede opening',()=>{
 const p=portfolio(),s=createExecutionState(p),proof=authorizeEntryBatch(batch(),p,prices,createAuthorizationState(p),at);
 expect(()=>acceptAuthorizations(createExecutionState({...p,availableCash:'9999.00000000',equity:'9999.00000000'}),proof)).toThrow(RangeError);
 const r=acceptAuthorizations(s,proof);expect(acceptAuthorizations(r,proof)).toEqual(r);
 const bad=structuredClone(proof);Object.assign(bad.state.decisions[0]!.quote.estimates!,{stopNetReceipt:'NaN'});expect(()=>acceptAuthorizations(r,bad)).toThrow(RangeError);
 expect(()=>acceptAuthorizations(processOpening(s,openings(),[],at),proof)).toThrow(RangeError);
});
test('orders have stable identities and distinguish fill, cancellation and expiration',()=>{
 const s=reserved(),r=processOpening(s,openings(),[],at),cancelled=processOpening(s,openings(at,'200.00000000'),[],at),expired=processOpening(s,openings(next),[],next);
 expect(s.orders[0]!.status).toBe('RESERVED');expect(r.orders[0]).toMatchObject({id:s.orders[0]!.id,status:'FILLED',fillId:r.fills[0]!.id});
 expect(cancelled.orders[0]!.status).toBe('CANCELLED');expect(expired.orders[0]!.status).toBe('EXPIRED');
 expect(expired.positions).toEqual([]);expect(r.reservations[0]!.source.execution).toBe('NOT_EXECUTED');
});
test('post-fill equity cannot relax a one-tick risk limit',()=>{
 const p={...portfolio(),equity:'0.00000400',dayOpeningEquity:'0.00000400',availableCash:'0.00000400'},refs={BTC:{...price,close:'0.01000000'},ETH:{...prices.ETH,close:'0.01000000'}};
 const proof=authorizeEntryBatch(batch(),p,refs,createAuthorizationState(p),at);expect(proof.decisions[0]!.status).toBe('AUTHORIZED');
 const r=processOpening(acceptAuthorizations(createExecutionState(p),proof),openings(at,'0.01000000','0.01000000'),[],at);
 expect(r.events.at(-1)!.reason).toBe('POST_FILL_LIMIT');expect(r.fills).toEqual([]);expect(r.portfolio.equity).toBe('0.00000400');
});
test.each(['RECOVERING','ENTRY_SUSPENDED','MANUAL_REVIEW_REQUIRED'] as const)('non-RUNNING %s never creates a fill',state=>{
 const r=processOpening(reserved(batch(),{...portfolio(),state}),openings(),[],at);expect(r.fills).toEqual([]);expect(r.positions).toEqual([]);
});
test('daily loss at3 percent blocks entry; one tick below remains eligible',()=>{
 const bad={...portfolio(),equity:'9700.00000000',availableCash:'9700.00000000'};
 expect(processOpening(reserved(batch(),bad),openings(),[],at).fills).toEqual([]);
 // Before executing, the imported D3.2 proof distinguishes the exact threshold.
 const good=reserved(batch(),{...bad,equity:'9700.00000001',availableCash:'9700.00000001'});
 expect(good.reservations).toHaveLength(1);
 // Execution's actual fees can reach the daily block; it must cancel safely.
 expect(processOpening(good,openings(),[],at).fills).toEqual([]);
});

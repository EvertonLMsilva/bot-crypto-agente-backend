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
test('D4 stop wins unknown intrabar sequence, with negative net PnL',()=>{
 const s=processOpening(reserved(),openings(),[],at),r=processClosedCandle(s,candles('100.00000000','105.00000000','97.00000000'),next);
 expect(r.positions[0]!.status).toBe('CLOSED');expect(r.fills[1]).toMatchObject({side:'SELL',reason:'STOP'});expect(r.realizedPnl.startsWith('-')).toBe(true);
 expect(r.positions[0]!.stop).toEqual({numerator:'980490000000',denominator:'100'});
});
test.each([['97.00000000','STOP','97.00000000'],['106.00000000','TAKE','104.05200000']])('gap %s caps %s reference',(open,reason,reference)=>{
 const s=processClosedCandle(processOpening(reserved(),openings(),[],at),candles(),next),request=createExitRequest(s.positions[0]!,next);
 const r=processOpening(s,openings(next,open),[request],next),ref=r.fills[1]!.reference;
 expect(r.fills[1]!.reason).toBe(reason);expect(BigInt(ref.numerator)/BigInt(ref.denominator)).toBe(BigInt(reference.replace('.','')));
 expect(r.events.at(-1)!.reason).toBe('SUPERSEDED_BY_PROTECTION');expect(r.fills.filter(f=>f.side==='SELL')).toHaveLength(1);
});
test.each([['98.04900000','101.00000000','STOP'],['99.00000000','104.05200000','TAKE']])('exact equality %s/%s activates %s',(low,high,reason)=>{
 const r=processClosedCandle(processOpening(reserved(),openings(),[],at),candles('100.00000000',high,low),next);
 expect(r.fills[1]!.reason).toBe(reason);expect(processClosedCandle(r,candles('100.00000000',high,low),next)).toEqual(r);
});
test('stale strategy exit requires revalidation without selling',()=>{
 const c=processClosedCandle(processOpening(reserved(),openings(),[],at),candles(),next),later='2026-01-01T01:10:00.000Z';
 const r=processClosedCandle(processOpening(c,openings(next),[],next),candles('100.00000000','101.00000000','99.00000000',next,later),later);
 const out=processOpening(r,openings(later),[createExitRequest(r.positions[0]!,next)],later);
 expect(out.positions[0]!.status).toBe('OPEN');expect(out.events.at(-1)!.reason).toBe('REVALIDATION_REQUIRED');
});
test('invalid exit origin or future signal and D1 pending cannot execute',()=>{
 const s=processClosedCandle(processOpening(reserved(),openings(),[],at),candles(),next),r=createExitRequest(s.positions[0]!,next);
 for(const patch of [{strategyVersion:'wrong'},{asset:'ETH'},{positionId:'wrong'},{signalAsOf:'2026-01-01T01:10:00.000Z'},{reason:'EXIT_EVALUATION_PENDING'}])
 expect(()=>processOpening(s,openings(next),[{...r,...patch} as typeof r],next)).toThrow(RangeError);
 expect(()=>createExitRequest({...s.positions[0]!,status:'CLOSED'},next)).toThrow(RangeError);
 expect(()=>processOpening(s,openings(next),[r,{...r,strategyVersion:'wrong'}],next)).toThrow(RangeError);
});
test('intrabar exit prevents reentry at the same closing/opening frontier',()=>{
 const closed=processClosedCandle(processOpening(reserved(),openings(),[],at),candles('100.00000000','105.00000000','97.00000000'),next);
 const p=projectExecutionBudget(closed),refs={BTC:{...price,closeTime:next},ETH:{...prices.ETH,closeTime:next}};
 const proof=authorizeEntryBatch(batch('BTC',next),p,refs,createAuthorizationState(p),next);
 const r=processOpening(acceptAuthorizations(closed,proof),openings(next),[],next);
 expect(r.fills).toHaveLength(2);expect(r.reservations[1]!.status).toBe('RELEASED');expect(r.events.at(-1)!.reason).toBe('SAME_FRONTIER_EXIT');
});
test('sub-tick stop precision is retained instead of feeding a rounded display level',()=>{
 const s=processOpening(reserved(),openings(at,'100.00000001'),[],at);
 expect(s.positions[0]!.stop).toEqual({numerator:'980490000196',denominator:'100'});
 const above=candles('100.00000000','101.00000000','98.04900002');Object.assign(above[0]!,{open:'100.00000001'});
 expect(processClosedCandle(s,above,next).positions[0]!.status).toBe('OPEN');
 const below=candles('100.00000000','101.00000000','98.04900001');Object.assign(below[0]!,{open:'100.00000001'});
 expect(processClosedCandle(s,below,next).fills[1]!.reason).toBe('STOP');
});

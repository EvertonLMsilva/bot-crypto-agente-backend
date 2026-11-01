import { createExecutionState, acceptAuthorizations, processOpening, processClosedCandle, validateExecutionState, createExitRequest, projectExecutionBudget } from '../../src/operations';
import { createAuthorizationState, authorizeEntryBatch } from '../../src/budget';
import { BudgetSnapshot, ClosedPriceReference } from '../../src/budget/types';
import { coordinateEntryBatch, CoordinationResult } from '../../src/coordination';
import { DecisionEnvelope } from '../../src/operations/types';
import { SignalAssessment } from '../../src/signals/types';
import { executionAmounts, exact, signed, parseSigned } from '../../src/operations/execution-accounting';
import { evaluateBudgetLimits } from '../../src/budget';
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
test('D4 closed mark changes equity without charging fees again',()=>{
 const s=processOpening(reserved(),openings(),[],at),r=processClosedCandle(s,candles('101.00000000','101.00000000','99.00000000'),next);
 expect(r.portfolio.equity).toBe('10008.49950000');expect(r.unrealizedPnl).toBe('8.49950000');expect(r.feesPaid).toBe('1.00050000');
});
test('full sale reconciles signed realized PnL, cash and actual fees',()=>{
 const closed=processClosedCandle(processOpening(reserved(),openings(),[],at),candles(),next);
 const req=createExitRequest(closed.positions[0]!,next),r=processOpening(closed,openings(next),[req],next);
 expect(r.positions[0]).toMatchObject({status:'CLOSED',realizedPnl:'-3.00000000'});expect(r.realizedPnl).toBe('-3.00000000');
 expect(r.unrealizedPnl).toBe('0.00000000');expect(r.portfolio.equity).toBe('9997.00000000');expect(r.feesPaid).toBe('2.00000000');
 expect(r.fills[1]).toMatchObject({price:'99.95000000',gross:'999.50000000',fee:'0.99950000',total:'998.50050000'});
 expect(r.portfolio.positions.BTC).toBe('FLAT');expect(r.portfolio.reservedCash).toBe('0.00000000');
});
test('midnight base uses known closed marks before next opening',()=>{
 const start='2026-01-01T23:55:00.000Z',end='2026-01-02T00:00:00.000Z',p={...portfolio(),asOf:start};
 const refs={BTC:{...price,closeTime:start},ETH:{...prices.ETH,closeTime:start}};
 const s=acceptAuthorizations(createExecutionState(p),authorizeEntryBatch(batch('BTC',start),p,refs,createAuthorizationState(p),start));
 const r=processClosedCandle(processOpening(s,openings(start),[],start),candles('101.00000000','101.00000000','99.00000000',start,end),end);
 expect(r.dailyBase).toBe('10008.49950000');expect(r.portfolio.dayOpeningEquity).toBe(r.portfolio.equity);
});
test.each(['availableCash','equity','reservedCash','committedRisk'] as const)('corrupt portfolio %s rejects',key=>{
 const s=structuredClone(processOpening(reserved(),openings(),[],at));Object.assign(s.portfolio,{[key]:'0.00000001'});
 expect(()=>validateExecutionState(s)).toThrow(RangeError);expect(()=>processClosedCandle(s,candles(),next)).toThrow(RangeError);
});
test('initial snapshot cannot invent positions, exposure, reserved funds or equity',()=>{
 for(const patch of [{positions:{BTC:'OPEN',ETH:'FLAT'}},{reservedCash:'1.00000000',availableCash:'9999.00000000'},
 {committedRisk:'1.00000000'},{committedExposure:{BTC:'1.00000000',ETH:'0.00000000'}},{availableCash:'9999.00000000'}])
 expect(()=>createExecutionState({...portfolio(),...patch} as BudgetSnapshot)).toThrow(RangeError);
});
test('actual fee is ceil8 once, proceeds floor8, reservation margin is not a fee',()=>{
 expect(executionAmounts('BUY','1.00000000',exact(10000000000n))).toEqual({price:'100.05000000',gross:'100.05000000',fee:'0.10005000',total:'100.15005000'});
 expect(executionAmounts('SELL','1.00000000',exact(10000000001n))).toEqual({price:'99.95000000',gross:'99.95000000',fee:'0.09995000',total:'99.85005000'});
 expect(signed(-1n)).toBe('-0.00000001');expect(parseSigned('-0.00000001')).toBe(-1n);
 expect(()=>parseSigned('-0.00000000')).toThrow(RangeError);expect(()=>exact(0n)).toThrow(RangeError);
 expect(()=>executionAmounts('SELL','0.00000001',exact(1n))).toThrow(RangeError);
 expect(()=>executionAmounts('SELL','0.00000001',exact(200n))).toThrow(RangeError);
 expect(()=>executionAmounts('BUY','0.00000000',exact(100n))).toThrow(RangeError);
});
test.each([
 ['2000.00000000','0.00000000','0.00000000',true],['2000.00000001','0.00000000','0.00000000',false]
])('reused D3.1 individual20 percent boundary %s', (cost,risk,priorRisk,eligible)=>{
 expect(evaluateBudgetLimits({...portfolio(),committedRisk:priorRisk},'BTC',cost,risk).eligible).toBe(eligible);
});
test('reused financial gates preserve40 percent,1/2 percent and a one-tick excess',()=>{
 const p={...portfolio(),committedExposure:{BTC:'0.00000000',ETH:'2000.00000000'},committedRisk:'100.00000000'};
 expect(evaluateBudgetLimits(p,'BTC','2000.00000000','100.00000000').eligible).toBe(true);
 expect(evaluateBudgetLimits(p,'BTC','2000.00000001','100.00000001').reasons).toEqual(expect.arrayContaining(['INDIVIDUAL_EXPOSURE_LIMIT','TOTAL_EXPOSURE_LIMIT','OPERATION_RISK_LIMIT','OPEN_RISK_LIMIT']));
});

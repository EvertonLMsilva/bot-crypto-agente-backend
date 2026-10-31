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
export function run(p=portfolio(), b=batch()){return authorizeEntryBatch(b,p,prices,createAuthorizationState(p),at);}
test('one authorization freezes exact D3.1 commitment without equity/position/fill effects',()=>{
 const r=run();expect(r.decisions[0]!.status).toBe('AUTHORIZED');
 expect(r.state.snapshot).toMatchObject({availableCash:'8988.48449500',reservedCash:'1011.51550500',equity:'10000.00000000',committedRisk:'22.70555221',positions:{BTC:'FLAT',ETH:'FLAT'}});
 expect(r.state.reservations[0]).toMatchObject({status:'ACTIVE',quantity:'10.00000000',capital:'1011.51550500',plannedRisk:'22.70555221',eligibleOpen:at,phase:'BEFORE_OPEN',execution:'NOT_EXECUTED'});
});
test('BTC/ETH use sequential shared cash in D2 order, not independent initial snapshots',()=>{
 const r=run({...portfolio(),availableCash:'1500.00000000'},both());
 expect(r.decisions.map(d=>[d.quote.asset,d.status])).toEqual([['BTC','AUTHORIZED'],['ETH','REJECTED']]);
 expect(r.decisions[1]!.quote.reasons).toContain('INSUFFICIENT_AVAILABLE_CASH');expect(r.state.reservations).toHaveLength(1);
});
test('two opportunities within limits reserve exact shared sums',()=>{
 const r=run(portfolio(),both());expect(r.decisions.map(d=>d.status)).toEqual(['AUTHORIZED','AUTHORIZED']);
 expect(r.state.snapshot).toMatchObject({availableCash:'7976.96899000',reservedCash:'2023.03101000',committedRisk:'45.41110442'});
});
test('local replay returns original decisions without a second debit',()=>{
 const b=both(),r=run(portfolio(),b),again=authorizeEntryBatch(b,r.state.snapshot,prices,r.state,at);
 expect(again.state.snapshot).toEqual(r.state.snapshot);expect(again.state.reservations).toEqual(r.state.reservations);
 expect(again.replayed).toEqual(b.opportunities.map(d=>d.id));
});
test.each([
 ['individual exposure','INDIVIDUAL_EXPOSURE_LIMIT',{committedExposure:{BTC:'988.48449501',ETH:'0.00000000'}}],
 ['total exposure','TOTAL_EXPOSURE_LIMIT',{committedExposure:{BTC:'0.00000000',ETH:'2988.48449501'}}],
 ['open risk','OPEN_RISK_LIMIT',{committedRisk:'177.29444780'}],
 ['daily loss','DAILY_LOSS_LIMIT',{equity:'9700.00000000',availableCash:'9700.00000000'}],
 ['recovering','STATE_RECOVERING',{state:'RECOVERING'}],
 ['suspended','STATE_ENTRY_SUSPENDED',{state:'ENTRY_SUSPENDED'}],
 ['manual review','STATE_MANUAL_REVIEW_REQUIRED',{state:'MANUAL_REVIEW_REQUIRED'}],
 ['open position','POSITION_OPEN',{positions:{BTC:'OPEN',ETH:'FLAT'}}],
 ['unknown position','POSITION_UNKNOWN',{positions:{BTC:'UNKNOWN',ETH:'FLAT'}}],
 ['active hold','RESERVATION_ACTIVE',{reservations:{BTC:'ACTIVE',ETH:'NONE'}}],
 ['unknown hold','RESERVATION_UNKNOWN',{reservations:{BTC:'UNKNOWN',ETH:'NONE'}}]
])('%s rejects, preserving quantity and technical decision',(_label,reason,patch)=>{
 const r=run({...portfolio(),...patch} as BudgetSnapshot),d=r.decisions[0]!;
 expect(d.status).toBe('REJECTED');expect(d.quote.reasons).toContain(reason);expect(r.state.reservations).toHaveLength(0);
 expect(d.quote.estimates!.quantity).toBe(reason==='DAILY_LOSS_LIMIT'?'9.70000000':'10.00000000');expect(batch().opportunities[0]!.candidate!.qualified).toBe(true);
});
test('exact maximum exposure and risk boundaries accept; one tick excess rejects',()=>{
 const p={...portfolio(),committedExposure:{BTC:'988.48449500',ETH:'2000.00000000'},committedRisk:'177.29444779'};
 expect(run(p).decisions[0]!.status).toBe('AUTHORIZED');
 expect(run({...p,committedRisk:'177.29444780'}).decisions[0]!.quote.reasons).toContain('OPEN_RISK_LIMIT');
});
test('quantity zero and sub-tick operation risk reject with existing D3.1 reasons',()=>{
 const p={...portfolio(),equity:'0.00000001',availableCash:'0.00000001'};
 const r=authorizeEntryBatch(batch(),p,{...prices,BTC:{...price,close:'10000000000000000.00000000'}},createAuthorizationState(p),at);
 expect(r.decisions[0]!.quote.reasons).toContain('ZERO_QUANTITY');
 const tiny={...portfolio(),equity:'0.00000101',availableCash:'0.00000101'};
 const q=authorizeEntryBatch(batch(),tiny,{...prices,BTC:{...price,close:'0.01000000'}},createAuthorizationState(tiny),at);
 expect(q.decisions[0]!.quote.reasons).toContain('OPERATION_RISK_LIMIT');
});
test('external arrival order does not change D2 order or reservation identity',()=>{
 const b=both(),reversed=coordinateEntryBatch([...b.opportunities].reverse(),at,{nextTieAsset:'BTC'});
 expect(run(portfolio(),b)).toEqual(run(portfolio(),reversed));
});
test('score affects D2 rank but never the D3.1 initial quantity',()=>{
 const b=structuredClone(batch());const d=b.opportunities[0]!;
 for(const a of [d.candidate!,d.audit.selection.representative!,d.audit.selection.assessments[2]!])Object.assign(a,{scoreRounded:90,scoreRaw:{numerator:'90',denominator:'1'}});
 const changed=coordinateEntryBatch(b.opportunities,at,{nextTieAsset:'BTC'});
 expect(run(portfolio(),changed).decisions[0]!.quote.estimates!.quantity).toBe('10.00000000');
});
test('same identity with changed price or evidence fails even on replay',()=>{
 const b=batch(),r=run();
 expect(()=>authorizeEntryBatch(b,r.state.snapshot,{...prices,BTC:{...price,close:'101.00000000'}},r.state,at)).toThrow(RangeError);
 const changed=structuredClone(b);Object.assign(changed.opportunities[0]!.candidate!,{technicalReason:'changed'});
 expect(()=>authorizeEntryBatch(changed,r.state.snapshot,prices,r.state,at)).toThrow(RangeError);
});
test('fresh frontier rejects stale opportunity; future or invalid data never authorize',()=>{
 const later='2026-01-01T01:05:00.000Z',p={...portfolio(),asOf:later},b=coordinateEntryBatch(batch().opportunities,later,{nextTieAsset:'BTC'});
 expect(authorizeEntryBatch(b,p,prices,createAuthorizationState(p),later).decisions[0]!.quote.reasons).toContain('STALE_SIGNAL');
 expect(()=>authorizeEntryBatch(batch(),portfolio(),{...prices,BTC:{...price,validatedClosed:false}},createAuthorizationState(portfolio()),at)).toThrow(RangeError);
 expect(()=>authorizeEntryBatch(batch(),portfolio(),prices,createAuthorizationState(portfolio()),later)).toThrow(RangeError);
});
test('duplicate or corrupt D2 evidence and missing closed prices fail atomically',()=>{
 const b=batch(),p=portfolio(),s=createAuthorizationState(p);
 expect(()=>authorizeEntryBatch({...b,opportunities:[...b.opportunities,...b.opportunities]},p,prices,s,at)).toThrow(RangeError);
 expect(()=>authorizeEntryBatch({...b,audit:{...b.audit,ranking:[]}},p,prices,s,at)).toThrow(RangeError);
 expect(()=>authorizeEntryBatch(b,p,{} as typeof prices,s,at)).toThrow(RangeError);
 const bad=structuredClone(b);Object.assign(bad.audit.ranking[0]!,{rank:2});
 expect(()=>authorizeEntryBatch(bad,p,prices,s,at)).toThrow(RangeError);expect(s.snapshot).toEqual(p);
});
test('second opportunity sees the first committed risk and total exposure',()=>{
 const risk=run({...portfolio(),committedRisk:'160.00000000'},both());
 expect(risk.decisions.map(d=>d.status)).toEqual(['AUTHORIZED','REJECTED']);expect(risk.decisions[1]!.quote.reasons).toContain('OPEN_RISK_LIMIT');
 const exposure=run({...portfolio(),committedExposure:{BTC:'0.00000000',ETH:'2900.00000000'}},both());
 expect(exposure.decisions.map(d=>d.status)).toEqual(['AUTHORIZED','REJECTED']);expect(exposure.decisions[1]!.quote.reasons).toContain('TOTAL_EXPOSURE_LIMIT');
});
test('one tick cash boundary never resizes and never borrows',()=>{
 expect(run({...portfolio(),availableCash:'1011.51550500'}).decisions[0]!.status).toBe('AUTHORIZED');
 const r=run({...portfolio(),availableCash:'1011.51550499'});expect(r.decisions[0]!.status).toBe('REJECTED');expect(r.state.snapshot.availableCash).toBe('1011.51550499');
 expect(r.decisions[0]!.quote.estimates!.quantity).toBe('10.00000000');
});
test('shared cash additions and reversals stay exact beyond Number safe integer precision',()=>{
 const money='9007199254740993.00000001',p={...portfolio(),equity:money,dayOpeningEquity:money,availableCash:money};
 const r=run(p,both());expect(r.decisions.every(d=>d.status==='AUTHORIZED')).toBe(true);
 expect(BigInt(r.state.snapshot.availableCash.replace('.',''))+BigInt(r.state.snapshot.reservedCash.replace('.',''))).toBe(BigInt(money.replace('.','')));
});

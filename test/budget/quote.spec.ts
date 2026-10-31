import { evaluateBudgetQuote } from '../../src/budget';
import { BudgetSnapshot, ClosedPriceReference } from '../../src/budget/types';
import { coordinateEntryBatch, CoordinationResult } from '../../src/coordination';
import { DecisionEnvelope } from '../../src/operations/types';
import { SignalAssessment } from '../../src/signals/types';
const at='2026-01-01T01:00:00.000Z';
function batch(asset:'BTC'|'ETH'='BTC',asOf=at):CoordinationResult{
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
function portfolio():BudgetSnapshot{return {asOf:at,state:'RUNNING',equity:'10000.00000000',dayOpeningEquity:'10000.00000000',availableCash:'10000.00000000',
  reservedCash:'0.00000000',committedExposure:{BTC:'0.00000000',ETH:'0.00000000'},committedRisk:'0.00000000',positions:{BTC:'FLAT',ETH:'FLAT'},reservations:{BTC:'NONE',ETH:'NONE'}};}
const price:ClosedPriceReference={asset:'BTC',closeTime:at,close:'100.00000000',validatedClosed:true};
test('independent10000/100 reference: quantity10, margin/slippage once, fees and stop-net risk',()=>{
  const b=batch(),r=evaluateBudgetQuote(b,1,portfolio(),price);
  expect(r).toMatchObject({status:'QUOTABLE',decisionId:b.opportunities[0]!.id,rank:1,asset:'BTC',asOf:at,signalAsOf:at,
    financialAuthorization:'NOT_EVALUATED',reservation:'NOT_CREATED',execution:'NOT_EXECUTED',reasons:[]});
  expect(r.estimates).toEqual({quantity:'10.00000000',exposureReference:'1000.00000000',conservativeBuyPrice:'101.05050000',
    grossCommitment:'1010.50500000',buyFee:'1.01050500',totalCommitment:'1011.51550500',stopPrice:'99.02949000',
    stopNetReceipt:'988.80995279',plannedRisk:'22.70555221'});
  expect(r.price).toEqual(price);expect(r.limits.projected.individualExposure).toBe('1011.51550500');
});
test('quantity is floored to8 decimals and costs/receipt use higher internal precision',()=>{
  const r=evaluateBudgetQuote(batch(),1,portfolio(),{...price,close:'3.00000000'});
  expect(r.estimates).toMatchObject({quantity:'333.33333333',exposureReference:'999.99999999',conservativeBuyPrice:'3.03151500',
    grossCommitment:'1010.50499999',buyFee:'1.01050500',totalCommitment:'1011.51550499',stopNetReceipt:'988.80995278',plannedRisk:'22.70555221'});
});
test('explicit equity drives sizing; sub-tick exposure target is not rounded before quantity division',()=>{
  const doubled=evaluateBudgetQuote(batch(),1,{...portfolio(),equity:'20000.00000000',dayOpeningEquity:'20000.00000000',availableCash:'20000.00000000'},price);
  expect(doubled.estimates!.quantity).toBe('20.00000000');expect(doubled.limits.limits.referenceInitialCapital).toBe('10000.00000000');
  // Keep the sub-tick target reference while leaving gross sale above the
  // one-tick fee. The former smaller fixture is covered by explicit rejection below.
  const tiny=evaluateBudgetQuote(batch(),1,{...portfolio(),equity:'0.00000101',availableCash:'0.00000101'},{...price,close:'0.01000000'});
  expect(tiny.estimates!.quantity).toBe('0.00001010');expect(tiny.status).toBe('NOT_QUOTABLE');
});
test('cash exactly the calculated commitment is quotable; one tick less is not',()=>{
  const p={...portfolio(),availableCash:'1011.51550500'};
  expect(evaluateBudgetQuote(batch(),1,p,price).status).toBe('QUOTABLE');
  expect(evaluateBudgetQuote(batch(),1,{...p,availableCash:'1011.51550499'},price).reasons).toContain('INSUFFICIENT_AVAILABLE_CASH');
});
test('insufficient limits never resize the initial quantity or consume cash',()=>{
  const p={...portfolio(),availableCash:'100.00000000'},before=JSON.stringify(p),r=evaluateBudgetQuote(batch(),1,p,price);
  expect(r.status).toBe('NOT_QUOTABLE');expect(r.reasons).toContain('INSUFFICIENT_AVAILABLE_CASH');expect(r.estimates!.quantity).toBe('10.00000000');
  expect(JSON.stringify(p)).toBe(before);
});
test('zero initial quantity explicitly blocks instead of creating a free opportunity',()=>{
  const r=evaluateBudgetQuote(batch(),1,{...portfolio(),equity:'0.00000001',availableCash:'0.00000001'}, {...price,close:'10000000000000000.00000000'});
  expect(r.status).toBe('NOT_QUOTABLE');expect(r.reasons).toContain('ZERO_QUANTITY');
});
test('current snapshot/closed reference required; old opportunity retains its original validity',()=>{
  const old=batch(),later='2026-01-01T01:05:00.000Z';
  const b=coordinateEntryBatch(old.opportunities,later,{nextTieAsset:'ETH'});
  const r=evaluateBudgetQuote(b,1,{...portfolio(),asOf:later},price);
  expect(r.status).toBe('NOT_QUOTABLE');expect(r.reasons).toContain('STALE_SIGNAL');expect(r.estimates).toBeNull();
  expect(r.signalAsOf).toBe(at);
  expect(()=>evaluateBudgetQuote({...old,asOf:'2026-01-01T00:55:00.000Z'},1,{...portfolio(),asOf:'2026-01-01T00:55:00.000Z'},price)).toThrow(RangeError);
});
test('reject invalid rank, WAIT/inconsistent D2 evidence, divergent timestamps/assets and unvalidated price',()=>{
  const b=batch();
  for(const rank of [0,2,-1,1.5,NaN])expect(()=>evaluateBudgetQuote(b,rank,portfolio(),price)).toThrow(RangeError);
  for(const patch of [{close:'0.00000000'},{close:'NaN'},{close:'1.0'},{asset:'ETH'},{validatedClosed:false},{closeTime:'2026-01-01T01:05:00.000Z'}])
    expect(()=>evaluateBudgetQuote(b,1,portfolio(),{...price,...patch} as ClosedPriceReference)).toThrow(RangeError);
  expect(()=>evaluateBudgetQuote(b,1,{...portfolio(),asOf:'2026-01-01T01:05:00.000Z'},price)).toThrow(RangeError);
  const wait={...b,opportunities:[{...b.opportunities[0]!,type:'WAIT' as const,candidate:null}]};
  expect(()=>evaluateBudgetQuote(wait,1,portfolio(),price)).toThrow(RangeError);
  const wrong={...b,audit:{...b.audit,ranking:[{...b.audit.ranking[0]!,decisionId:'wrong'}]}};
  expect(()=>evaluateBudgetQuote(wrong,1,portfolio(),price)).toThrow(RangeError);
});
test('contradictory source audit and malformed selected evidence cannot become financial advice',()=>{
  const b=batch();
  const wrongPosition={...b,opportunities:[{...b.opportunities[0]!,audit:{...b.opportunities[0]!.audit,position:{...b.opportunities[0]!.position,status:'OPEN' as const}}}]};
  expect(()=>evaluateBudgetQuote(wrongPosition,1,portfolio(),price)).toThrow(RangeError);
  for(const patch of [{R:0},{scoreRaw:{numerator:'NaN',denominator:'1'}}]){
    const bad=JSON.parse(JSON.stringify(b)) as CoordinationResult,d=bad.opportunities[0]!;
    for(const a of [d.candidate!,d.audit.selection.representative!,d.audit.selection.assessments[2]!])Object.assign(a,patch);
    expect(()=>evaluateBudgetQuote(bad,1,portfolio(),price)).toThrow(RangeError);
  }
});
test('asset exposures and guards are independent; high score cannot waive position/reservation checks',()=>{
  const p={...portfolio(),committedExposure:{BTC:'2000.00000000',ETH:'0.00000000'}};
  expect(evaluateBudgetQuote(batch(),1,p,price).reasons).toContain('INDIVIDUAL_EXPOSURE_LIMIT');
  expect(evaluateBudgetQuote(batch('ETH'),1,p,{...price,asset:'ETH'}).status).toBe('QUOTABLE');
  for(const status of ['OPEN','UNKNOWN'] as const)expect(evaluateBudgetQuote(batch(),1,{...portfolio(),positions:{BTC:status,ETH:'FLAT'}},price).status).toBe('NOT_QUOTABLE');
  expect(evaluateBudgetQuote(batch(),1,{...portfolio(),reservations:{BTC:'ACTIVE',ETH:'NONE'}},price).status).toBe('NOT_QUOTABLE');
});
test('deterministic immutable JSON advice: no input freezing, clock, randomness or financial effects',()=>{
  const b=structuredClone(batch()),p=portfolio(),ref={...price},before=JSON.stringify({b,p,ref});
  jest.spyOn(Date,'now').mockImplementation(()=>{throw new Error('real clock');});jest.spyOn(Math,'random').mockImplementation(()=>{throw new Error('random');});
  try{
    const r=evaluateBudgetQuote(b,1,p,ref);expect(evaluateBudgetQuote(b,1,p,ref)).toEqual(r);
    expect(JSON.parse(JSON.stringify(r))).toEqual(r);expect(JSON.stringify({b,p,ref})).toBe(before);
    expect(Object.isFrozen(p)).toBe(false);expect(Object.isFrozen(ref)).toBe(false);
    const frozen=(v:unknown):void=>{if(v&&typeof v==='object'){expect(Object.isFrozen(v)).toBe(true);Object.values(v).forEach(frozen);}};frozen(r);
    ref.close='1.00000000';expect(r.price.close).toBe('100.00000000');
    for(const key of ['order','fill','authorizedCapital','cashAfter'])expect(r).not.toHaveProperty(key);
  }finally{jest.restoreAllMocks();}
});

test('regression: sell fee0.00098981 yields net0.98881019 and risk0.02270559, preserving buy sizing/reserve',()=>{
  const p={...portfolio(),equity:'10.00000260',dayOpeningEquity:'10.00000260',availableCash:'10.00000260'};
  const r=evaluateBudgetQuote(batch(),1,p,{...price,close:'1.00000026'});
  expect(r.status).toBe('QUOTABLE');
  expect(r.estimates).toMatchObject({quantity:'1.00000000',exposureReference:'1.00000026',
    grossCommitment:'1.01050527',buyFee:'0.00101051',totalCommitment:'1.01151578',stopNetReceipt:'0.98881019',plannedRisk:'0.02270559'});
  // Gross stop proceeds floor=0.98980000; ceil sell fee=0.00098981.
  // Its fractional remainder must not restore the lost tick to net proceeds.
  expect(r.limits.projected.openRisk).toBe('0.02270559');
  expect(r.limits.projected.individualExposure).toBe('1.01151578');
});
test('sell fee below one tick is charged once as one tick, not rounded to zero',()=>{
  const p={...portfolio(),equity:'0.00001000',dayOpeningEquity:'0.00001000',availableCash:'0.00001000'};
  const r=evaluateBudgetQuote(batch(),1,p,{...price,close:'0.00000100'});
  // Gross stop proceeds=0.00000098979975255, fee exact<0.00000001.
  expect(r.estimates).toMatchObject({quantity:'1.00000000',totalCommitment:'0.00000103',stopNetReceipt:'0.00000097',plannedRisk:'0.00000006'});
  expect(r.status).toBe('QUOTABLE');
});
test('sell fee already an exact tick multiple is not incremented or applied twice',()=>{
  const p={...portfolio(),equity:'10000000.00000000',dayOpeningEquity:'10000000.00000000',availableCash:'10000000.00000000'};
  const r=evaluateBudgetQuote(batch(),1,p,{...price,close:'1000000.00000000'});
  // Gross stop989799.75255000, sell fee989.79975255 (already exact8).
  expect(r.estimates).toMatchObject({quantity:'1.00000000',totalCommitment:'1011515.50500000',stopNetReceipt:'988809.95279745',plannedRisk:'22705.55220255'});
});
test('corrected planned risk, not the old tick-lower value, is checked against unchanged open-risk limit',()=>{
  const p={...portfolio(),equity:'10.00000260',dayOpeningEquity:'10.00000260',availableCash:'10.00000260',committedRisk:'0.17729447'};
  const r=evaluateBudgetQuote(batch(),1,p,{...price,close:'1.00000026'});
  expect(r.limits.limits.openRisk).toBe('0.20000005');expect(r.limits.projected.openRisk).toBe('0.20000006');
  expect(r.status).toBe('NOT_QUOTABLE');expect(r.reasons).toEqual(['OPEN_RISK_LIMIT']);
});
test('corrected regression is deterministic, immutable, serializable and has no financial effects',()=>{
  const b=batch(),p={...portfolio(),equity:'10.00000260',dayOpeningEquity:'10.00000260',availableCash:'10.00000260'},ref={...price,close:'1.00000026'};
  const before=JSON.stringify({b,p,ref}),r=evaluateBudgetQuote(b,1,p,ref);
  expect(evaluateBudgetQuote(b,1,p,ref)).toEqual(r);expect(JSON.parse(JSON.stringify(r))).toEqual(r);
  expect(JSON.stringify({b,p,ref})).toBe(before);expect(Object.isFrozen(r.estimates)).toBe(true);
  expect(Object.isFrozen(p)).toBe(false);expect(Object.isFrozen(ref)).toBe(false);
  expect(r).toMatchObject({financialAuthorization:'NOT_EVALUATED',reservation:'NOT_CREATED',execution:'NOT_EXECUTED'});
});
test('a quantized sell fee exceeding gross proceeds explicitly rejects a negative net estimate',()=>{
  expect(()=>evaluateBudgetQuote(batch(),1,{...portfolio(),equity:'0.00000001',availableCash:'0.00000001'},
    {...price,close:'0.01000000'})).toThrow(RangeError);
});

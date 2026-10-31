import { createAuthorizationState, authorizeEntryBatch, releaseReservation, expireReservations, validateAuthorizationState } from '../../src/budget';
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
test('deterministic deeply immutable JSON copies without real clock/randomness or caller mutation',()=>{
 const p=portfolio(),b=both(),refs=structuredClone(prices),s=createAuthorizationState(p),before=JSON.stringify({p,b,refs,s});
 jest.spyOn(Date,'now').mockImplementation(()=>{throw Error('clock');});jest.spyOn(Math,'random').mockImplementation(()=>{throw Error('random');});
 try{const r=authorizeEntryBatch(b,p,refs,s,at);expect(authorizeEntryBatch(b,p,refs,s,at)).toEqual(r);expect(JSON.parse(JSON.stringify(r))).toEqual(r);
 const check=(v:unknown):void=>{if(v&&typeof v==='object'){expect(Object.isFrozen(v)).toBe(true);Object.values(v).forEach(check);}};check(r);
 expect(JSON.stringify({p,b,refs,s})).toBe(before);expect(Object.isFrozen(p)).toBe(false);Object.assign(refs.BTC,{close:'1.00000000'});expect(r.decisions[0]!.quote.price.close).toBe('100.00000000');
 expect(r).not.toHaveProperty('fill');expect(r.state.snapshot.equity).toBe(p.equity);
 }finally{jest.restoreAllMocks();}
});
test.each(['availableCash','reservedCash','committedRisk'] as const)('one tick corrupted %s fails exact reconciliation',key=>{
 const s=structuredClone(run().state);Object.assign(s.snapshot,{[key]:'0.00000001'});expect(()=>validateAuthorizationState(s)).toThrow(RangeError);
});
test.each(['quantity','capital','plannedRisk','strategyVersion','eligibleOpen','id'] as const)('tampered frozen reservation %s fails',key=>{
 const s=structuredClone(run().state);Object.assign(s.reservations[0]!,{[key]:'0.00000001'});expect(()=>validateAuthorizationState(s)).toThrow(RangeError);
});
test('orphans, duplicate decisions/reservations, missing transitions and SETTLED fail',()=>{
 const s=run().state;
 for(const bad of [{...s,reservations:[]},{...s,reservations:[...s.reservations,...s.reservations]},
 {...s,decisions:[...s.decisions,...s.decisions]},{...s,reservations:[{...s.reservations[0]!,status:'SETTLED' as const}]}])expect(()=>validateAuthorizationState(bad)).toThrow(RangeError);
 const released=releaseReservation(s,s.reservations[0]!.id,at);expect(()=>validateAuthorizationState({...released,transitions:[]})).toThrow(RangeError);
 expect(()=>validateAuthorizationState({...released,transitions:[...released.transitions,...released.transitions]})).toThrow(RangeError);
});
test('corrupt audit snapshots, sequence, request or status cannot be silently consumed',()=>{
 const s=run().state;
 for(const patch of [{request:'not JSON'},{request:'[]'},{sequence:99},{status:'OTHER'},
 {before:{...s.snapshot,availableCash:'1.00000000'}},{after:portfolio()}]){
 const bad=structuredClone(s);Object.assign(bad.decisions[0]!,patch);expect(()=>validateAuthorizationState(bad)).toThrow(RangeError);
 }
 const released=releaseReservation(s,s.reservations[0]!.id,at),bad=structuredClone(released);Object.assign(bad.transitions[0]!,{reason:'FILLED'});
 expect(()=>validateAuthorizationState(bad)).toThrow(RangeError);
});
test('invalid state, noncanonical money, UTC, missing snapshot, cycles and non-JSON evidence reject',()=>{
 expect(()=>createAuthorizationState({...portfolio(),equity:'NaN'})).toThrow(RangeError);
 expect(()=>createAuthorizationState({...portfolio(),asOf:'2026-01-01T01:00:00+00:00'})).toThrow(RangeError);
 expect(()=>validateAuthorizationState(null as unknown as ReturnType<typeof createAuthorizationState>)).toThrow(RangeError);
 const s=createAuthorizationState(portfolio());expect(()=>validateAuthorizationState({...s,phase:'UNKNOWN' as 'BEFORE_OPEN'})).toThrow(RangeError);
 const cyclic:Record<string,unknown>={};cyclic.self=cyclic;expect(()=>validateAuthorizationState(cyclic as unknown as typeof s)).toThrow(RangeError);
 expect(()=>validateAuthorizationState({...s,extra:new Date()} as typeof s)).toThrow(RangeError);
 expect(()=>authorizeEntryBatch(batch(),{...portfolio(),availableCash:'9999.00000000'},prices,s,at)).toThrow(RangeError);
});
test('empty valid D2 batch has no financial effect',()=>{
 const b=coordinateEntryBatch([],at,{nextTieAsset:'BTC'}),r=run(portfolio(),b);expect(r.state.snapshot).toEqual(portfolio());expect(r.decisions).toEqual([]);
});
test('a recorded lost opening cannot be changed back to BEFORE_OPEN',()=>{
 const r=run(),s=expireReservations(r.state,at,'AFTER_OPEN');
 expect(()=>validateAuthorizationState({...s,phase:'BEFORE_OPEN'})).toThrow(RangeError);
});
test.each(['NaN','0.00000000'])('FIX001 replay rejects contradictory stop receipt %s before accepting state',receipt=>{
 const s=structuredClone(run().state);Object.assign(s.decisions[0]!.quote.estimates!,{stopNetReceipt:receipt});
 const before=JSON.stringify(s);
 expect(()=>authorizeEntryBatch(batch(),s.snapshot,prices,s,at)).toThrow(RangeError);
 expect(()=>validateAuthorizationState(s)).toThrow(RangeError);expect(JSON.stringify(s)).toBe(before);
});
test.each(['quantity','exposureReference','conservativeBuyPrice','grossCommitment','buyFee','totalCommitment','stopPrice','stopNetReceipt','plannedRisk'] as const)(
 'FIX001 rejects noncanonical %s in stored estimates',key=>{
 const s=structuredClone(run().state);Object.assign(s.decisions[0]!.quote.estimates!,{[key]:'1.0'});
 expect(()=>validateAuthorizationState(s)).toThrow(RangeError);
});
test.each(['Infinity','-0.00000001','01.00000000','1e0',' 1.00000000',undefined,null,1])('FIX001 invalid/missing monetary evidence %s rejects',value=>{
 const s=structuredClone(run().state);Object.assign(s.decisions[0]!.quote.estimates!,{stopNetReceipt:value});
 expect(()=>validateAuthorizationState(s)).toThrow(RangeError);
});
test.each([
 ['plannedRisk','22.70555222'],['totalCommitment','1011.51550501'],['grossCommitment','1010.50500001'],
 ['buyFee','1.01050501'],['exposureReference','1000.00000001'],['conservativeBuyPrice','101.05050001'],['stopPrice','99.02949001']
])('FIX001 canonical but contradictory %s rejects', (key,value)=>{
 const s=structuredClone(run().state);Object.assign(s.decisions[0]!.quote.estimates!,{[key]:value});
 expect(()=>validateAuthorizationState(s)).toThrow(RangeError);
});
test('FIX001 rejects a coherent-looking redistribution of gross cost and fee',()=>{
 const s=structuredClone(run().state);Object.assign(s.decisions[0]!.quote.estimates!,{grossCommitment:'1010.50499999',buyFee:'1.01050501'});
 // Gross + fee still equals1011.51550500; matching sums alone cannot prove provenance.
 expect(()=>validateAuthorizationState(s)).toThrow(RangeError);
});
test('FIX001 quote/reservation commitment mismatch rejects before replay',()=>{
 const s=structuredClone(run().state);Object.assign(s.reservations[0]!,{capital:'1011.51550501'});
 expect(()=>authorizeEntryBatch(batch(),s.snapshot,prices,s,at)).toThrow(RangeError);
});
test('FIX001 rejects corrupted estimates on a rejected decision too',()=>{
 const s=structuredClone(run({...portfolio(),availableCash:'100.00000000'}).state);
 Object.assign(s.decisions[0]!.quote.estimates!,{stopNetReceipt:'NaN'});
 expect(()=>validateAuthorizationState(s)).toThrow(RangeError);
});
test('FIX001 approved independent reference remains exact, immutable, serializable and idempotent',()=>{
 const r=run(portfolio(),both()),before=JSON.stringify(r.state);
 expect(r.decisions[0]!.quote.estimates).toMatchObject({grossCommitment:'1010.50500000',buyFee:'1.01050500',totalCommitment:'1011.51550500',
 stopNetReceipt:'988.80995279',plannedRisk:'22.70555221',quantity:'10.00000000'});
 const again=authorizeEntryBatch(both(),r.state.snapshot,prices,r.state,at);
 expect(again.state.snapshot).toEqual(r.state.snapshot);expect(again.replayed).toHaveLength(2);
 expect(JSON.stringify(r.state)).toBe(before);expect(JSON.parse(JSON.stringify(again))).toEqual(again);
 expect(Object.isFrozen(again.decisions[0]!.quote.estimates)).toBe(true);
});

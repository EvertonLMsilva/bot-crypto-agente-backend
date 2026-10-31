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
test('release reverses only the local hold, exactly once, without creating equity or cash',()=>{
 const r=run(),id=r.state.reservations[0]!.id,s=releaseReservation(r.state,id,at);
 expect(s.snapshot).toEqual(portfolio());expect(s.reservations[0]!.status).toBe('RELEASED');expect(s.transitions).toHaveLength(1);
 expect(releaseReservation(s,id,at)).toEqual(s);expect(s.transitions[0]).toMatchObject({sequence:2,from:'ACTIVE',to:'RELEASED',reason:'CANCELLED'});
});
test('released identity never becomes ACTIVE on reprocessing',()=>{
 const r=run(),s=releaseReservation(r.state,r.state.reservations[0]!.id,at);
 const again=authorizeEntryBatch(batch(),s.snapshot,prices,s,at);
 expect(again.state.reservations).toEqual(s.reservations);expect(again.state.snapshot).toEqual(s.snapshot);expect(again.replayed).toHaveLength(1);
});
test('lost opening explicitly expires both holds without fees, positions or fills',()=>{
 const r=run(portfolio(),both()),s=expireReservations(r.state,at,'AFTER_OPEN');
 expect(s.phase).toBe('AFTER_OPEN');expect(s.snapshot).toEqual(portfolio());expect(s.reservations.map(v=>v.status)).toEqual(['RELEASED','RELEASED']);
 expect(s.transitions.map(t=>t.reason)).toEqual(['EXPIRED','EXPIRED']);expect(expireReservations(s,at,'AFTER_OPEN')).toEqual(s);
 expect(s.reservations.every(v=>v.execution==='NOT_EXECUTED')).toBe(true);
});
test('AFTER_OPEN blocks new authorization at that boundary, not a later valid cycle',()=>{
 const s=expireReservations(createAuthorizationState(portfolio()),at,'AFTER_OPEN');
 expect(()=>authorizeEntryBatch(batch(),s.snapshot,prices,s,at)).toThrow(RangeError);
 const later='2026-01-01T01:05:00.000Z',p={...s.snapshot,asOf:later},refs={BTC:{...price,closeTime:later},ETH:{...prices.ETH,closeTime:later}};
 expect(authorizeEntryBatch(batch('BTC',later),p,refs,s,later).decisions[0]!.status).toBe('AUTHORIZED');
});
test('out-of-order releases, unknown IDs, unsupported transition and phase reject',()=>{
 const s=run().state,id=s.reservations[0]!.id;
 expect(()=>releaseReservation(s,'unknown',at)).toThrow(RangeError);
 expect(()=>releaseReservation(s,id,'2026-01-01T00:55:00.000Z')).toThrow(RangeError);
 expect(()=>releaseReservation(s,id,at,'SETTLED' as 'CANCELLED')).toThrow(RangeError);
 expect(()=>expireReservations(s,at,'BEFORE_OPEN' as 'AFTER_OPEN')).toThrow(RangeError);
 expect(()=>expireReservations(s,'2026-01-01T00:55:00.000Z','AFTER_OPEN')).toThrow(RangeError);
});
test('advance and repeated expiration cannot credit released cash again',()=>{
 const r=run(),later='2026-01-01T01:05:00.000Z',s=expireReservations(r.state,later,'AFTER_OPEN');
 const twice=expireReservations(s,'2026-01-01T01:10:00.000Z','AFTER_OPEN');expect(twice.snapshot.availableCash).toBe('10000.00000000');expect(twice.transitions).toHaveLength(1);
 expect(()=>releaseReservation(twice,r.state.reservations[0]!.id,later)).toThrow(RangeError);
});
test('external baseline reserved cash is preserved and never released as a local hold',()=>{
 const p={...portfolio(),availableCash:'9000.00000000',reservedCash:'1000.00000000',committedExposure:{BTC:'0.00000000',ETH:'1000.00000000'},reservations:{BTC:'NONE' as const,ETH:'ACTIVE' as const}};
 const r=run(p),s=releaseReservation(r.state,r.state.reservations[0]!.id,at);expect(s.snapshot).toEqual(p);
});
test('direct expiration marks AFTER_OPEN so another asset cannot enter that lost opening',()=>{
 const r=run(),s=releaseReservation(r.state,r.state.reservations[0]!.id,at,'EXPIRED');
 expect(s.phase).toBe('AFTER_OPEN');expect(()=>authorizeEntryBatch(batch('ETH'),s.snapshot,prices,s,at)).toThrow(RangeError);
});
test.each(['NaN','0.00000000'])('FIX001 corrupt quote %s cannot release or expire capital',receipt=>{
 const s=structuredClone(run().state),id=s.reservations[0]!.id;
 Object.assign(s.decisions[0]!.quote.estimates!,{stopNetReceipt:receipt});const before=JSON.stringify(s);
 expect(()=>releaseReservation(s,id,at)).toThrow(RangeError);
 expect(()=>expireReservations(s,at,'AFTER_OPEN')).toThrow(RangeError);
 expect(JSON.stringify(s)).toBe(before);expect(s.snapshot.availableCash).toBe('8988.48449500');
});
test('FIX001 valid release/expiration preserve exact funds and stay terminal on replay',()=>{
 const r=run(),id=r.state.reservations[0]!.id;
 const released=releaseReservation(r.state,id,at),expired=expireReservations(r.state,at,'AFTER_OPEN');
 for(const s of [released,expired]){
 expect(s.snapshot).toEqual(portfolio());expect(releaseReservation(s,id,at)).toEqual(s);
 const replay=authorizeEntryBatch(batch(),s.snapshot,prices,s,at);expect(replay.state.reservations[0]!.status).toBe('RELEASED');
 expect(replay.state.snapshot.availableCash).toBe('10000.00000000');expect(replay.state.transitions).toHaveLength(1);
 expect(Object.isFrozen(s.snapshot)).toBe(true);expect(JSON.parse(JSON.stringify(s))).toEqual(s);
 }
});

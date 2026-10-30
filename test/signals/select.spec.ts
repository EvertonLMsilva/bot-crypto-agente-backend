import { agreement, compareCandidates } from '../../src/signals/select';
import { evaluateSignalCandidates } from '../../src/signals';
import { ActivePolicy, SignalAssessment } from '../../src/signals/types';
import { TECHNICAL_FAMILIES, TechnicalAssessment } from '../../src/strategies';
import * as c2 from '../../src/strategies/evaluate';
import { Candle, toDecimalString as dec } from '../../src/simulation/candle';

const q=(n:number|string,d:number|string=1)=>({numerator:String(n),denominator:String(d)});
const policy:ActivePolicy={id:'BTC-P0',version:'1',asset:'BTC',state:'UNVALIDATED',families:TECHNICAL_FAMILIES.map(family=>({family,id:family,version:'1'}))};
const feed={status:'VALID' as const,events:[]};
function market(n=25):Candle[]{return Array.from({length:n},(_,i)=>({asset:'BTC',
  openTime:new Date(Date.UTC(2026,0,1)+i*300000).toISOString(),closeTime:new Date(Date.UTC(2026,0,1)+(i+1)*300000).toISOString(),
  open:dec(10000000000n+BigInt(i)*100000000n),close:dec(10000000000n+BigInt(i)*100000000n),
  high:dec(10100000000n+BigInt(i)*100000000n),low:dec(9900000000n+BigInt(i)*100000000n),volume:'100.00000000'}));}
const asOf=(c:readonly Candle[])=>c.at(-1)!.closeTime;
function evidence(c:readonly Candle[]):TechnicalAssessment[]{return TECHNICAL_FAMILIES.map(family=>({asset:'BTC',closeTime:asOf(c),family,
  regimeCloseTime:null,confirmedRegime:'UPTREND',volatility:'NORMAL',warmupComplete:true,triggerMet:true,G:1,F:0,Q:0,V:0,T:0,
  technicalEligible:true,reason:'TECHNICALLY_ELIGIBLE'}));}
const participant=(family= 'TREND',T=q(60),eligible=true)=>({asset:'BTC' as const,policyId:'BTC-P0',policyVersion:'1',policyState:'UNVALIDATED' as const,family:family as typeof TECHNICAL_FAMILIES[number],familyId:family,eligible,T});
afterEach(()=>jest.restoreAllMocks());

test('agreement requires distinct eligible families with exact T>=60; only participants receive100',()=>{
  expect(agreement([participant()])).toEqual([{A:50,participant:false}]);
  expect(agreement([participant(),participant('BREAKOUT')])).toEqual([{A:100,participant:true},{A:100,participant:true}]);
  expect(agreement([participant(),participant('BREAKOUT',q('59999999999999999','1000000000000000'))])).toEqual([{A:50,participant:false},{A:50,participant:false}]);
  expect(agreement([participant(),participant('BREAKOUT'),participant('MEAN_REVERSION',q(59))])).toEqual([{A:100,participant:true},{A:100,participant:true},{A:50,participant:false}]);
  expect(agreement([participant(),participant('BREAKOUT',q(100),false)])).toEqual([{A:50,participant:false},{A:null,participant:false}]);
});
test('agreement rejects duplicate families, mixed assets/policies and shadow state',()=>{
  for(const bad of [participant(),{...participant('BREAKOUT'),asset:'ETH'}, {...participant('BREAKOUT'),policyId:'BTC-P1'},
    {...participant('BREAKOUT'),policyVersion:'2'},{...participant('BREAKOUT'),policyState:'SHADOW'}]){
    expect(()=>agreement([participant(),bad] as Parameters<typeof agreement>[0])).toThrow(RangeError);
  }
});
test('ranking uses rounded S, exact raw S, exact T, R, then canonical ascending ID',()=>{
  const a={scoreRounded:70,scoreRaw:q(70),T:q(90),R:90,id:'a'} as SignalAssessment;
  for(const better of [{scoreRounded:71},{scoreRaw:q('700000000000000001','10000000000000000')},
    {T:q('900000000000000001','10000000000000000')},{R:100},{id:'A'}]){
    const b={...a,...better};expect(compareCandidates(b,a)).toBeLessThan(0);expect(compareCandidates(a,b)).toBeGreaterThan(0);
  }
  expect(compareCandidates(a,a)).toBe(0);
  expect(()=>compareCandidates({...a,T:null},a)).toThrow(RangeError);
});
test('one C2 call, independent per-family exact scores, discarded evidence and no operational order',()=>{
  const c=market(),spy=jest.spyOn(c2,'evaluateTechnicalStrategies').mockReturnValue(evidence(c));
  const result=evaluateSignalCandidates(c,asOf(c),feed,policy);
  expect(spy).toHaveBeenCalledTimes(1);expect(result.assessments).toHaveLength(3);
  expect(result.assessments[0]).toMatchObject({T:q(80),TApproximate:0,R:100,C:q(50),H:0,A:50,scoreRaw:q('131',2),scoreRounded:66,qualified:false});
  expect(result.assessments[1]).toMatchObject({T:q(50),R:90,A:50,scoreRounded:53,qualified:false});
  expect(result.assessments[2]).toMatchObject({R:null,A:null,scoreRaw:null,qualified:false});
  expect(result.representative).toBeNull();expect(result.discarded).toHaveLength(3);
  expect(JSON.stringify(result)).not.toMatch(/ENTRY_CANDIDATE|order|position|reservation/);
});
test('qualifying families produce a representative; losing qualified and ineligible assessments survive',()=>{
  const c=market();c[c.length-1]={...c.at(-1)!,volume:'150.00000000',close:c.at(-1)!.high};
  jest.spyOn(c2,'evaluateTechnicalStrategies').mockReturnValue(evidence(c));
  const result=evaluateSignalCandidates(c,asOf(c),feed,policy);
  expect(result.representative?.family).toBe('TREND');expect(result.assessments[0]!.A).toBe(100);
  expect(result.assessments[1]!.qualified).toBe(true);expect(result.discarded.map(d=>d.reason)).toEqual(['LOWER_RANKED','NOT_QUALIFIED']);
  expect(result.assessments[2]!.reasons).toContain('INCOMPATIBLE_REGIME_FAMILY');
});
test('invalid context blocks qualification; C2 ineligibility cannot be overridden',()=>{
  const c=market(),t=evidence(c);t[0]={...t[0]!,technicalEligible:false,reason:'WARMUP_INCOMPLETE'};
  jest.spyOn(c2,'evaluateTechnicalStrategies').mockReturnValue(t);
  const r=evaluateSignalCandidates(c,asOf(c),{status:'INVALID',events:[]},policy);
  expect(r.representative).toBeNull();expect(r.assessments.every(a=>a.scoreRaw===null)).toBe(true);
  expect(r.assessments[0]!.reasons).toContain('TECHNICAL:WARMUP_INCOMPLETE');
  expect(r.assessments[1]!.reasons).toContain('CONTEXT:INVALID_FEED');
});
test('policy rejects H/history/shadow and mixed or missing family identity before evaluating',()=>{
  const c=market(),spy=jest.spyOn(c2,'evaluateTechnicalStrategies');
  for(const bad of [{...policy,H:0},{...policy,history:[]},{...policy,state:'SHADOW'},{...policy,id:'ETH-P0'},
    {...policy,asset:'ETH'},{...policy,version:''},{...policy,families:[]},
    {...policy,families:[policy.families[0],policy.families[0],policy.families[2]]},
    {...policy,families:policy.families.map(f=>({...f,H:0}))}]){
    expect(()=>evaluateSignalCandidates(c,asOf(c),feed,bad as ActivePolicy)).toThrow(RangeError);
  }
  expect(spy).not.toHaveBeenCalled();
});
test('real C2 validation rejects future, gaps, precision collapse and invalid snapshots',()=>{
  const c=market();
  expect(()=>evaluateSignalCandidates(c,c[20]!.closeTime,feed,policy)).toThrow(RangeError);
  expect(()=>evaluateSignalCandidates(c.filter((_,i)=>i!==10),asOf(c),feed,policy)).toThrow(RangeError);
  const lost=market(30).map((x,i)=>({...x,open:`10000000000000000.${String(i).padStart(8,'0')}`,close:`10000000000000000.${String(i).padStart(8,'0')}`,high:'10000000000000001.00000000',low:'9999999999999999.00000000'}));
  expect(()=>evaluateSignalCandidates(lost,asOf(lost),feed,policy)).toThrow(RangeError);
});
test('real snapshots are deterministic, serializable and immutable; ETH cannot influence BTC',()=>{
  const c=Object.freeze(market(30).map(x=>Object.freeze(x))),before=JSON.stringify({c,policy,feed});
  const first=evaluateSignalCandidates(c,asOf(c),feed,policy);
  const eth=c.map(x=>({...x,asset:'ETH' as const}));
  evaluateSignalCandidates(eth,asOf(eth),feed,{...policy,id:'ETH-P0',asset:'ETH'});
  expect(evaluateSignalCandidates(c,asOf(c),feed,policy)).toEqual(first);
  expect(JSON.stringify({c,policy,feed})).toBe(before);expect(Object.isFrozen(first.assessments)).toBe(true);
  expect(first.discarded).toHaveLength(3);expect(first.assessments.every(x=>x.reasons.length>0)).toBe(true);
});
test('real150h C2 recovery qualifies only with sufficient causal context; no real clock or randomness',()=>{
  const c=market(1803).map((x,i)=>{
    const p=i===1800||i===1801?8000000000n:10000000000n;
    return Object.freeze({...x,open:dec(p),close:dec(p),high:dec(p+300000000n),low:dec(p-300000000n),
      volume:i===1802?'150.00000000':'100.00000000'});
  });
  const clock=jest.spyOn(Date,'now').mockImplementation(()=>{throw new Error('real clock forbidden');});
  const random=jest.spyOn(Math,'random').mockImplementation(()=>{throw new Error('randomness forbidden');});
  const neutral=evaluateSignalCandidates(c,asOf(c),feed,policy);
  expect(neutral.assessments[2]).toMatchObject({G:1,T:q(90),A:50,scoreRounded:69,qualified:false});
  expect(neutral.representative).toBeNull();
  const withContext=evaluateSignalCandidates(c,asOf(c),{status:'VALID',events:[{eventId:'e1',groupId:'g1',revision:1,
    previousEventId:null,source:'test',publishedAt:asOf(c),availableAt:asOf(c),sequence:1,category:'CRYPTO',state:'CONFIRMED',
    impacts:{BTC:{direction:1,intensity:30}}}]},policy);
  expect(withContext.representative).toMatchObject({family:'MEAN_REVERSION',T:q(90),C:q(80),scoreRaw:q(147,2),scoreRounded:74});
  expect(clock).not.toHaveBeenCalled();expect(random).not.toHaveBeenCalled();
});

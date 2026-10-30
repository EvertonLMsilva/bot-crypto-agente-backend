import { prepareSimulatedDecision } from '../../src/operations';
import { ActivePolicy, ContextFeed, SignalAssessment, SignalSelection } from '../../src/signals/types';
import { PositionView } from '../../src/operations/types';
import * as c3 from '../../src/signals/select';
import { Candle, toDecimalString as dec } from '../../src/simulation/candle';

const q=(n:number|string,d:number|string=1)=>({numerator:String(n),denominator:String(d)});
const families=['TREND','BREAKOUT','MEAN_REVERSION'] as const;
const policy:ActivePolicy={id:'BTC-P0',version:'1',asset:'BTC',state:'UNVALIDATED',families:families.map(family=>({family,id:family,version:'1'}))};
const feed:ContextFeed={status:'VALID',events:[]};
function candles(count=12):Candle[]{return Array.from({length:count},(_,i)=>({asset:'BTC',
  openTime:new Date(Date.UTC(2026,0,1)+i*300000).toISOString(),closeTime:new Date(Date.UTC(2026,0,1)+(i+1)*300000).toISOString(),
  open:'100.00000000',close:'100.00000000',high:'103.00000000',low:'97.00000000',volume:'100.00000000'}));}
const at=(c:readonly Candle[])=>c.at(-1)!.closeTime;
const position=(c:readonly Candle[],status:PositionView['status']='FLAT'):PositionView=>({asset:c.at(-1)!.asset,asOf:at(c),status});
function selection(c:readonly Candle[],qualified=true):SignalSelection {
  const assessments:SignalAssessment[]=families.map((family,i)=>({family,G:i===2?0:1,F:q(i===0?1:0),Q:q(1,2),V:q(i===0?1:0),T:q(i===0?90:i===1?50:10),reasons:[i===2?'INCOMPATIBLE_REGIME_FAMILY':i===0&&qualified?'QUALIFIED':'BELOW_THRESHOLD'],
    id:`assessment-${i}`,asset:'BTC',closeTime:at(c),policyId:'BTC-P0',policyVersion:'1',familyId:family,familyVersion:'1',
    technicalEligible:i!==2,technicalReason:i===2?'REGIME_INCOMPATIBLE':'TECHNICALLY_ELIGIBLE',TApproximate:i===0?90:i===1?50:10,
    R:i===2?null:i===0?100:90,C:q(qualified?80:50),H:0,A:i===2?null:50,agreementParticipant:false,
    scoreRaw:i===2?null:i===0?(qualified?q(147,2):q(69)):(qualified?q(57):q(105,2)),
    scoreRounded:i===2?null:i===0?(qualified?74:69):(qualified?57:53),qualified:i===0&&qualified}));
  const representative=qualified?assessments[0]!:null;
  return {asset:'BTC',asOf:at(c),policyId:'BTC-P0',policyVersion:'1',context:{status:'VALID',C:q(qualified?80:50),U:0,reason:'VALID_FEED',groups:qualified?[{
    groupId:'g1',state:'CONFIRMED',eventIds:['e1'],anchorTime:at(c),contribution:q(30),rumorPenalty:0}]:[]},assessments,representative,
    discarded:assessments.filter(a=>a!==representative).map(assessment=>({assessment,reason:'NOT_QUALIFIED'}))};
}
afterEach(()=>jest.restoreAllMocks());
test('FLAT qualified representative becomes one proposal, preserving C3 ranking and exact evidence with one call',()=>{
  const c=candles(),input=selection(c),p=position(c),before=JSON.stringify({input,p});
  const spy=jest.spyOn(c3,'evaluateSignalCandidates').mockReturnValue(input);
  const result=prepareSimulatedDecision(c,at(c),feed,policy,p);
  expect(spy).toHaveBeenCalledTimes(1);expect(spy).toHaveBeenCalledWith(c,at(c),feed,policy);
  expect(result).toMatchObject({type:'ENTRY_CANDIDATE',asset:'BTC',asOf:at(c),policyId:'BTC-P0',policyVersion:'1',
    reasons:['QUALIFIED_REPRESENTATIVE'],financialAuthorization:'NOT_EVALUATED',execution:'NOT_EXECUTED',validity:'NEXT_ELIGIBLE_OPEN_ONLY'});
  expect(result.candidate).toEqual(input.representative);expect(result.audit.selection).toEqual(input);
  expect(result.audit.selection.assessments).toHaveLength(3);expect(result.audit.selection.discarded).toHaveLength(2);
  expect(result.candidate!.scoreRaw).toEqual(q(147,2));expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  expect(Object.isFrozen(result)).toBe(true);expect(Object.isFrozen(result.candidate!.scoreRaw)).toBe(true);
  expect(Object.isFrozen(input.representative)).toBe(false);expect(Object.isFrozen(p)).toBe(false);
  expect(JSON.stringify({input,p})).toBe(before);
  const frozen=(value:unknown):void=>{if(value&&typeof value==='object'){
    expect(Object.isFrozen(value)).toBe(true);Object.values(value).forEach(frozen);
  }};
  frozen(result);
  (input.representative!.scoreRaw as {numerator:string}).numerator='0';
  (p as {status:string}).status='OPEN';
  expect(result.candidate!.scoreRaw).toEqual(q(147,2));expect(result.position.status).toBe('FLAT');
  expect(before).not.toBe(JSON.stringify({input,p}));
  for(const key of ['quantity','price','reservation','authorizedCapital','order','fill'])expect(result).not.toHaveProperty(key);
});
test.each(['OPEN','UNKNOWN'] as const)('%s blocks a qualified representative without concluding HOLD or exit safety',status=>{
  const c=candles();jest.spyOn(c3,'evaluateSignalCandidates').mockReturnValue(selection(c));
  const result=prepareSimulatedDecision(c,at(c),feed,policy,position(c,status));
  expect(result).toMatchObject({type:'WAIT',candidate:null,reasons:[`POSITION_${status}`],validity:'CURRENT_CYCLE_ONLY',
    exitEvaluation:status==='OPEN'?'EXIT_EVALUATION_PENDING':'NOT_EVALUATED'});
  expect(result.audit.selection.representative).not.toBeNull();expect(JSON.stringify(result)).not.toContain('"HOLD"');
});
test('FLAT without representative yields WAIT and retains rejections',()=>{
  const c=candles(),s=selection(c,false);jest.spyOn(c3,'evaluateSignalCandidates').mockReturnValue(s);
  const result=prepareSimulatedDecision(c,at(c),feed,policy,position(c));
  expect(result).toMatchObject({type:'WAIT',candidate:null,reasons:['NO_QUALIFIED_REPRESENTATIVE'],exitEvaluation:'NOT_APPLICABLE'});
  expect(result.audit.selection.discarded).toEqual(s.discarded);
});
test('stable IDs derive from cycle, policy, strategy and decision type; no clock or randomness',()=>{
  const c=candles(),spy=jest.spyOn(c3,'evaluateSignalCandidates').mockReturnValue(selection(c));
  jest.spyOn(Date,'now').mockImplementation(()=>{throw new Error('real clock');});
  jest.spyOn(Math,'random').mockImplementation(()=>{throw new Error('random');});
  const first=prepareSimulatedDecision(c,at(c),feed,policy,position(c));
  expect(prepareSimulatedDecision(c,at(c),feed,policy,position(c))).toEqual(first);
  expect(prepareSimulatedDecision(c,at(c).replace('.000Z','Z'),feed,policy,position(c)).id).toBe(first.id);
  expect(prepareSimulatedDecision(c,at(c),feed,policy,position(c,'OPEN')).id).not.toBe(first.id);
  const next=candles(13);spy.mockReturnValue(selection(next));
  expect(prepareSimulatedDecision(next,at(next),feed,policy,position(next)).id).not.toBe(first.id);
  const original=selection(c),newOrigin={...original.representative!,familyVersion:'2'},
    changed={...original,representative:newOrigin,assessments:[newOrigin,...original.assessments.slice(1)]};
  spy.mockReturnValue(changed);expect(prepareSimulatedDecision(c,at(c),feed,policy,position(c)).id).not.toBe(first.id);
});
test('missing/invalid position, divergent asset/asOf and non-UTC time explicitly fail',()=>{
  const c=candles(),spy=jest.spyOn(c3,'evaluateSignalCandidates');
  for(const p of [undefined,null,{...position(c),asset:'ETH'},{...position(c),asOf:c[0]!.closeTime},{...position(c),status:'CLOSED'}]){
    expect(()=>prepareSimulatedDecision(c,at(c),feed,policy,p as PositionView)).toThrow(RangeError);
  }
  expect(()=>prepareSimulatedDecision(c,'2026-01-01T01:00:00+00:00',feed,policy,position(c))).toThrow(RangeError);
  expect(spy).not.toHaveBeenCalled();
});
test('invalid C3 representative or snapshot identity is rejected rather than becoming an entry',()=>{
  const c=candles(),s=selection(c),spy=jest.spyOn(c3,'evaluateSignalCandidates');
  spy.mockReturnValue({...s,asset:'ETH'});
  expect(()=>prepareSimulatedDecision(c,at(c),feed,policy,position(c))).toThrow(RangeError);
  spy.mockReturnValue({...s,representative:{...s.representative!,qualified:false}});
  expect(()=>prepareSimulatedDecision(c,at(c),feed,policy,position(c))).toThrow(RangeError);
});
test('invalid calendar and non-five-minute boundaries fail explicitly',()=>{
  const c=candles();
  for(const invalid of ['2026-02-30T01:00:00.000Z','2026-01-01T01:01:00.000Z']){
    expect(()=>prepareSimulatedDecision(c,invalid,feed,policy,{...position(c),asOf:invalid})).toThrow(RangeError);
  }
});
test('policy version and strategy ID remain part of the stable proposal identity',()=>{
  const c=candles(),s=selection(c),spy=jest.spyOn(c3,'evaluateSignalCandidates').mockReturnValue(s);
  const first=prepareSimulatedDecision(c,at(c),feed,policy,position(c));
  const revisedAssessments=s.assessments.map(a=>({...a,policyVersion:'2'}));
  const revised={...s,policyVersion:'2',assessments:revisedAssessments,representative:revisedAssessments[0]!,
    discarded:revisedAssessments.slice(1).map(assessment=>({assessment,reason:'NOT_QUALIFIED' as const}))};
  spy.mockReturnValue(revised);
  expect(prepareSimulatedDecision(c,at(c),feed,{...policy,version:'2'},position(c)).id).not.toBe(first.id);
  const origin={...s.representative!,familyId:'trend-versioned'};
  spy.mockReturnValue({...s,representative:origin,assessments:[origin,...s.assessments.slice(1)]});
  const changedPolicy={...policy,families:policy.families.map(f=>f.family==='TREND'?{...f,id:origin.familyId}:f)};
  expect(prepareSimulatedDecision(c,at(c),feed,changedPolicy,position(c)).id).not.toBe(first.id);
});
test('real C3: insufficient score/context and non-flat positions cannot propose an entry',()=>{
  const c=candles(1803).map((x,i)=>{const p=i===1800||i===1801?8000000000n:10000000000n;
    return {...x,open:dec(p),close:dec(p),high:dec(p+300000000n),low:dec(p-300000000n),volume:i===1802?'150.00000000':'100.00000000'};});
  const positive:ContextFeed={status:'VALID',events:[{eventId:'e1',groupId:'g1',revision:1,previousEventId:null,source:'test',
    publishedAt:at(c),availableAt:at(c),sequence:1,category:'CRYPTO',state:'CONFIRMED',impacts:{BTC:{direction:1,intensity:30}}}]};
  const proposal=prepareSimulatedDecision(c,at(c),positive,policy,position(c));
  expect(proposal).toMatchObject({type:'ENTRY_CANDIDATE',candidate:{family:'MEAN_REVERSION',scoreRounded:74}});
  expect(prepareSimulatedDecision(c,at(c),feed,policy,position(c)).type).toBe('WAIT');
  expect(prepareSimulatedDecision(c,at(c),{status:'INVALID',events:[]},policy,position(c)).type).toBe('WAIT');
  for(const status of ['OPEN','UNKNOWN'] as const)expect(prepareSimulatedDecision(c,at(c),positive,policy,position(c,status)).type).toBe('WAIT');
});
test('real C3: future/gaps/mixed policy are rejected; frozen prefixes and BTC/ETH remain independent',()=>{
  const c=Object.freeze(candles(24).map(x=>Object.freeze(x))),before=JSON.stringify({c,policy,feed}),p=position(c);
  const result=prepareSimulatedDecision(c,at(c),feed,policy,p);
  const extended=candles(36),prefix=extended.slice(0,24);
  expect(prepareSimulatedDecision(prefix,at(prefix),feed,policy,position(prefix))).toEqual(result);
  expect(()=>prepareSimulatedDecision(c,c[11]!.closeTime,feed,policy,{...p,asOf:c[11]!.closeTime})).toThrow(RangeError);
  expect(()=>prepareSimulatedDecision(c.filter((_,i)=>i!==5),at(c),feed,policy,p)).toThrow(RangeError);
  expect(()=>prepareSimulatedDecision(c,at(c),feed,{...policy,asset:'ETH',id:'ETH-P0'},p)).toThrow(RangeError);
  const eth=c.map(x=>({...x,asset:'ETH' as const})),ethResult=prepareSimulatedDecision(eth,at(eth),feed,{...policy,asset:'ETH',id:'ETH-P0'},position(eth));
  expect(ethResult.id).not.toBe(result.id);expect(ethResult.asset).toBe('ETH');
  expect(prepareSimulatedDecision(c,at(c),feed,policy,p)).toEqual(result);
  expect(JSON.stringify({c,policy,feed})).toBe(before);expect(Object.isFrozen(p)).toBe(false);
});

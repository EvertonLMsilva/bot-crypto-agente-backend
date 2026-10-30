import { coordinateEntryBatch } from '../../src/coordination';
import { prepareSimulatedDecision, DecisionEnvelope, PositionView } from '../../src/operations';
import { ActivePolicy, ContextFeed } from '../../src/signals/types';
import { Candle } from '../../src/simulation/candle';

function decision(asset:'BTC'|'ETH',status:PositionView['status']='FLAT',lessContext=false,unavailable=false):DecisionEnvelope {
  const candles:Candle[]=Array.from({length:1803},(_,i)=>{const p=i===1800||i===1801?80:100;
    return {asset,openTime:new Date(Date.UTC(2026,0,1)+i*300000).toISOString(),closeTime:new Date(Date.UTC(2026,0,1)+(i+1)*300000).toISOString(),
      open:`${p}.00000000`,close:`${p}.00000000`,high:`${i===1802?p:p+3}.00000000`,low:`${p-3}.00000000`,volume:i===1802?'150.00000000':'100.00000000'};});
  const asOf=candles.at(-1)!.closeTime;
  const policy:ActivePolicy={id:`${asset}-P0`,asset,version:'1',state:'UNVALIDATED',families:['TREND','BREAKOUT','MEAN_REVERSION'].map(family=>({family:family as 'TREND'|'BREAKOUT'|'MEAN_REVERSION',id:family,version:'1'}))};
  const feed:ContextFeed={status:'VALID',events:[30,lessContext?10:20].map((intensity,i)=>({eventId:`e${i}`,groupId:`g${i}`,revision:1,
    previousEventId:null,source:'test',publishedAt:asOf,availableAt:asOf,sequence:i+1,category:'CRYPTO',state:'CONFIRMED',impacts:{[asset]:{direction:1,intensity}}}))} as ContextFeed;
  return prepareSimulatedDecision(candles,asOf,unavailable?{status:'INVALID',events:[]}:feed,policy,{asset,asOf,status});
}
const batchTime='2026-01-08T00:00:00.000Z',state={nextTieAsset:'ETH' as const};
let btc:DecisionEnvelope,eth:DecisionEnvelope,open:DecisionEnvelope,unknown:DecisionEnvelope,alternate:DecisionEnvelope;
beforeAll(()=>{btc=decision('BTC');eth=decision('ETH');open=decision('BTC','OPEN');unknown=decision('ETH','UNKNOWN');alternate=decision('BTC','FLAT',true);});
test('orders real D1 proposals, preserves snapshots and origin, and performs no financial action',()=>{
  const result=coordinateEntryBatch([btc,eth],batchTime,state);
  expect(result.opportunities).toEqual([eth,btc]);expect(result.waits).toEqual([]);
  expect(result).toMatchObject({asOf:batchTime,nextState:{nextTieAsset:'BTC'},financialAuthorization:'NOT_EVALUATED',execution:'NOT_EXECUTED'});
  expect(result.audit.ranking.map(r=>r.decisionId)).toEqual([eth.id,btc.id]);
  expect(result.audit.ranking[0]).toMatchObject({criterion:'ROUND_ROBIN',scoreRounded:80,asset:'ETH',policyId:'ETH-P0',strategyId:'MEAN_REVERSION'});
  expect(result.opportunities[0]!.asOf).toBe(eth.asOf);expect(result.opportunities[0]!.validity).toBe('NEXT_ELIGIBLE_OPEN_ONLY');
  for(const key of ['order','fill','reservation','authorizedCapital'])expect(result).not.toHaveProperty(key);
});
test('WAIT remains separate with position reasons and exit pending; no candidate becomes executable',()=>{
  const r=coordinateEntryBatch([unknown,open],batchTime,state);
  expect(r.opportunities).toHaveLength(0);expect(r.waits).toEqual([open,unknown]);
  expect(r.waits[0]).toMatchObject({type:'WAIT',candidate:null,reasons:['POSITION_OPEN'],exitEvaluation:'EXIT_EVALUATION_PENDING'});
  expect(r.nextState).toEqual(state);
});
test('duplicates ignore identical content, including property insertion order, and are audited',()=>{
  const reordered=Object.fromEntries(Object.entries(btc).reverse()) as unknown as DecisionEnvelope;
  const r=coordinateEntryBatch([btc,reordered,btc,eth],batchTime,state);
  expect(r.opportunities).toHaveLength(2);expect(r.audit.duplicates).toEqual([{decisionId:btc.id,ignoredCount:2}]);
  expect(coordinateEntryBatch([eth,btc,btc,reordered],batchTime,state)).toEqual(r);
});
test('same ID divergent content and two official decisions per asset/cycle are rejected',()=>{
  expect(alternate.id).toBe(btc.id);expect(alternate.candidate!.scoreRaw).not.toEqual(btc.candidate!.scoreRaw);
  expect(()=>coordinateEntryBatch([btc,alternate],batchTime,state)).toThrow('Divergent content for the same decision ID');
  expect(()=>coordinateEntryBatch([btc,open],batchTime,state)).toThrow(RangeError);
});
test('WAIT duplicates are audited once and never enter the opportunity ranking',()=>{
  const r=coordinateEntryBatch([open,open,unknown],batchTime,state);
  expect(r.waits).toHaveLength(2);expect(r.opportunities).toEqual([]);expect(r.audit.ranking).toEqual([]);
  expect(r.audit.duplicates).toEqual([{decisionId:open.id,ignoredCount:1}]);expect(r.nextState).toEqual(state);
});
test('non-serializable, cyclic, missing or malformed decision evidence fails with RangeError',()=>{
  for(const value of [undefined,null,[],new Date(0),1n]){
    expect(()=>coordinateEntryBatch([value] as unknown as DecisionEnvelope[],batchTime,state)).toThrow(RangeError);
  }
  const cycle:Record<string,unknown>={};cycle.self=cycle;
  expect(()=>coordinateEntryBatch([cycle] as unknown as DecisionEnvelope[],batchTime,state)).toThrow(RangeError);
  const sparse={...btc,audit:{...btc.audit,selection:{...btc.audit.selection,assessments:new Array(3)}}};
  expect(()=>coordinateEntryBatch([sparse],batchTime,state)).toThrow(RangeError);
  expect(()=>coordinateEntryBatch(null as unknown as DecisionEnvelope[],batchTime,state)).toThrow(RangeError);
});
test('entry guard rejects OPEN/UNKNOWN, invalid scores, qualified flag, and unexpected financial states',()=>{
  for(const status of ['OPEN','UNKNOWN']){
    const bad=structuredClone(btc);(bad.position as {status:string}).status=status;
    expect(()=>coordinateEntryBatch([bad],batchTime,state)).toThrow(RangeError);
  }
  for(const score of [69,101,70.5,NaN]){
    const bad=structuredClone(btc);(bad.candidate as {scoreRounded:number}).scoreRounded=score;
    expect(()=>coordinateEntryBatch([bad],batchTime,state)).toThrow(RangeError);
  }
  for(const patch of [{candidate:null},{candidate:{...btc.candidate!,qualified:false}},{financialAuthorization:'AUTHORIZED'},
    {execution:'EXECUTED'},{validity:'CURRENT_CYCLE_ONLY'}]){
    expect(()=>coordinateEntryBatch([{...btc,...patch} as DecisionEnvelope],batchTime,state)).toThrow(RangeError);
  }
});
test('audit identity, representative, metadata and WAIT semantics cannot diverge from D1',()=>{
  const patches=[{id:'forged'},{asset:'ETH'},{policyId:'ETH-P0'},{asOf:'2026-01-07T06:20:00.000Z'},
    {audit:{...btc.audit,decisionId:'other'}},{audit:{...btc.audit,selection:{...btc.audit.selection,representative:eth.candidate}}},
    {audit:{...btc.audit,selection:{...btc.audit.selection,assessments:[]}}}];
  for(const patch of patches)expect(()=>coordinateEntryBatch([{...btc,...patch} as DecisionEnvelope],batchTime,state)).toThrow(RangeError);
  for(const patch of [{candidate:btc.candidate},{reasons:['NO_QUALIFIED_REPRESENTATIVE']},{exitEvaluation:'NOT_APPLICABLE'}]){
    expect(()=>coordinateEntryBatch([{...open,...patch} as DecisionEnvelope],batchTime,state)).toThrow(RangeError);
  }
});
test('causality, strict UTC calendar and explicit state are enforced',()=>{
  expect(()=>coordinateEntryBatch([btc],'2026-01-07T06:10:00.000Z',state)).toThrow(RangeError);
  for(const invalid of ['2026-02-30T00:00:00.000Z','2026-01-08T00:01:00.000Z','2026-01-08T00:00:00+00:00']){
    expect(()=>coordinateEntryBatch([btc],invalid,state)).toThrow(RangeError);
  }
  for(const badState of [undefined,{}, {nextTieAsset:'SOL'}])expect(()=>coordinateEntryBatch([],batchTime,badState as typeof state)).toThrow(RangeError);
});
test('deep immutability and independent JSON snapshots; inputs are never frozen or changed',()=>{
  const input=structuredClone([btc,eth]),s={nextTieAsset:'ETH' as const},before=JSON.stringify({input,s});
  jest.spyOn(Date,'now').mockImplementation(()=>{throw new Error('real time');});
  jest.spyOn(Math,'random').mockImplementation(()=>{throw new Error('random');});
  try{
    const r=coordinateEntryBatch(input,batchTime,s);
    expect(coordinateEntryBatch([...input].reverse(),batchTime,s)).toEqual(r);
    expect(JSON.stringify({input,s})).toBe(before);expect(Object.isFrozen(input[0])).toBe(false);expect(Object.isFrozen(s)).toBe(false);
    const frozen=(v:unknown):void=>{if(v&&typeof v==='object'){expect(Object.isFrozen(v)).toBe(true);Object.values(v).forEach(frozen);}};frozen(r);
    expect(JSON.parse(JSON.stringify(r))).toEqual(r);
    (input[0]!.candidate!.scoreRaw as {numerator:string}).numerator='0';
    expect(r.opportunities.find(d=>d.asset==='BTC')!.candidate!.scoreRaw).toEqual(btc.candidate!.scoreRaw);
  }finally{jest.restoreAllMocks();}
});

test.each([false,true])('context-only C0 versus assessments C100 is rejected in either batch order: reversed=%s',reversed=>{
  const bad=structuredClone(btc);
  (bad.audit.selection.context as {C:{numerator:string;denominator:string}}).C={numerator:'0',denominator:'1'};
  expect(bad.candidate!.C).toEqual({numerator:'100',denominator:'1'});
  const input=reversed?[eth,bad]:[bad,eth];
  expect(()=>coordinateEntryBatch(input,batchTime,state)).toThrow(RangeError);
});
test('equal C throughout the original valid contract remains accepted',()=>{
  const result=coordinateEntryBatch([btc],batchTime,state);
  expect(result.opportunities).toEqual([btc]);
  expect(result.opportunities[0]!.audit.selection.assessments.every(a=>a.C?.numerator==='100'&&a.C.denominator==='1')).toBe(true);
});
test('equivalent contextual fractions are compared exactly, independently in every evidence location',()=>{
  const equivalent={numerator:'200',denominator:'2'};
  for(const target of ['context','candidate','representative','assessment','discarded'] as const){
    // JSON copying deliberately separates shared representative/assessment references.
    const detached=JSON.parse(JSON.stringify(btc)) as DecisionEnvelope;
    const s=detached.audit.selection;
    if(target==='context')(s.context as {C:typeof equivalent}).C=equivalent;
    if(target==='candidate')(detached.candidate as {C:typeof equivalent}).C=equivalent;
    if(target==='representative')(s.representative as {C:typeof equivalent}).C=equivalent;
    if(target==='assessment')(s.assessments[0] as {C:typeof equivalent}).C=equivalent;
    if(target==='discarded')(s.discarded[0]!.assessment as {C:typeof equivalent}).C=equivalent;
    const result=coordinateEntryBatch([detached],batchTime,state);
    expect(result.opportunities).toEqual([detached]);
  }
});
test('a non-representative assessment with divergent C is rejected even when its discarded copy matches',()=>{
  const bad=JSON.parse(JSON.stringify(btc)) as DecisionEnvelope,s=bad.audit.selection;
  const other=s.assessments.find(a=>a.id!==s.representative!.id)!;
  const discarded=s.discarded.find(a=>a.assessment.id===other.id)!.assessment;
  for(const a of [other,discarded])(a as {C:{numerator:string;denominator:string}}).C={numerator:'0',denominator:'1'};
  expect(()=>coordinateEntryBatch([bad],batchTime,state)).toThrow(RangeError);
});
test('candidate-only and representative-only divergent context are rejected',()=>{
  for(const target of ['candidate','representative'] as const){
    const bad=JSON.parse(JSON.stringify(btc)) as DecisionEnvelope;
    const a=target==='candidate'?bad.candidate!:bad.audit.selection.representative!;
    (a as {C:{numerator:string;denominator:string}}).C={numerator:'0',denominator:'1'};
    expect(()=>coordinateEntryBatch([bad],batchTime,state)).toThrow(RangeError);
  }
});
test('real WAIT with unavailable C=null is preserved; null/value divergences never become entries',()=>{
  const wait=decision('BTC','FLAT',false,true),r=coordinateEntryBatch([wait],batchTime,state);
  expect(r.opportunities).toEqual([]);expect(r.waits).toEqual([wait]);
  expect(wait.audit.selection.context.C).toBeNull();expect(wait.audit.selection.assessments.every(a=>a.C===null)).toBe(true);
  const bad=JSON.parse(JSON.stringify(wait)) as DecisionEnvelope;
  (bad.audit.selection.assessments[0] as {C:unknown}).C={numerator:'0',denominator:'1'};
  const mirror=bad.audit.selection.discarded[0]!.assessment;
  (mirror as {C:unknown}).C={numerator:'0',denominator:'1'};
  expect(()=>coordinateEntryBatch([bad],batchTime,state)).toThrow(RangeError);
  const reverse=JSON.parse(JSON.stringify(open)) as DecisionEnvelope;
  (reverse.audit.selection.assessments[0] as {C:unknown}).C=null;
  (reverse.audit.selection.discarded.find(d=>d.assessment.id===reverse.audit.selection.assessments[0]!.id)!.assessment as {C:unknown}).C=null;
  expect(()=>coordinateEntryBatch([reverse],batchTime,state)).toThrow(RangeError);
});
test('invalid contextual fractions fail explicitly at every C comparison boundary',()=>{
  for(const invalid of [{numerator:'100',denominator:'0'},{numerator:'NaN',denominator:'1'},{numerator:'100',denominator:'-1'}]){
    for(const target of ['context','candidate','representative'] as const){
      const bad=JSON.parse(JSON.stringify(btc)) as DecisionEnvelope;
      const item=target==='context'?bad.audit.selection.context:target==='candidate'?bad.candidate!:bad.audit.selection.representative!;
      (item as {C:unknown}).C=invalid;
      expect(()=>coordinateEntryBatch([bad],batchTime,state)).toThrow(RangeError);
    }
  }
});

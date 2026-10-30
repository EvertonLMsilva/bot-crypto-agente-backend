import { coordinateEntryBatch } from '../../src/coordination';
import { prepareSimulatedDecision, DecisionEnvelope } from '../../src/operations';
import { ActivePolicy, ContextFeed } from '../../src/signals/types';
import { Candle } from '../../src/simulation/candle';
function entry(asset:'BTC'|'ETH',day=1,open=false):DecisionEnvelope{
  const candles:Candle[]=Array.from({length:1803},(_,i)=>{const p=i===1800||i===1801?80:100;return {asset,
    openTime:new Date(Date.UTC(2026,0,day)+i*300000).toISOString(),closeTime:new Date(Date.UTC(2026,0,day)+(i+1)*300000).toISOString(),
    open:`${p}.00000000`,close:`${p}.00000000`,high:`${p+3}.00000000`,low:`${p-3}.00000000`,volume:i===1802?'150.00000000':'100.00000000'};});
  const asOf=candles.at(-1)!.closeTime;
  const policy:ActivePolicy={asset,id:`${asset}-P0`,version:'1',state:'UNVALIDATED',families:['TREND','BREAKOUT','MEAN_REVERSION'].map(family=>({family:family as 'TREND'|'BREAKOUT'|'MEAN_REVERSION',id:family,version:'1'}))};
  const feed:ContextFeed={status:'VALID',events:[{eventId:'e1',groupId:'g1',revision:1,previousEventId:null,source:'test',publishedAt:asOf,availableAt:asOf,
    sequence:1,category:'CRYPTO',state:'CONFIRMED',impacts:{[asset]:{direction:1,intensity:30}}}]};
  return prepareSimulatedDecision(candles,asOf,feed,policy,{asset,asOf,status:open?'OPEN':'FLAT'});
}
let btc:DecisionEnvelope,eth:DecisionEnvelope,laterBtc:DecisionEnvelope,laterEth:DecisionEnvelope,wait:DecisionEnvelope;
const time='2026-01-09T00:00:00.000Z';
beforeAll(()=>{btc=entry('BTC');eth=entry('ETH');laterBtc=entry('BTC',2);laterEth=entry('ETH',2);wait=entry('BTC',1,true);});
test.each(['BTC','ETH'] as const)('one real tie alternates %s preference explicitly',nextTieAsset=>{
  const state=Object.freeze({nextTieAsset}),r=coordinateEntryBatch([btc,eth],time,state);
  expect(r.opportunities[0]!.asset).toBe(nextTieAsset);
  expect(r.nextState.nextTieAsset).toBe(nextTieAsset==='BTC'?'ETH':'BTC');
  expect(r.audit.previousState).toEqual(state);expect(r.audit.nextState).toEqual(r.nextState);expect(r.audit.ties).toHaveLength(1);
});
test('without a complete score/time tie, preserve caller preference',()=>{
  const state={nextTieAsset:'ETH' as const},r=coordinateEntryBatch([btc,laterEth],time,state);
  expect(r.opportunities).toEqual([btc,laterEth]);expect(r.nextState).toEqual(state);expect(r.audit.ties).toEqual([]);
});
test('WAIT, empty batches and duplicate entries never manufacture rotation',()=>{
  const state={nextTieAsset:'BTC' as const};
  for(const input of [[],[wait],[btc,btc]])expect(coordinateEntryBatch(input,time,state).nextState).toEqual(state);
});
test('multiple tie groups resolve in score/time order with explicit sequential preference',()=>{
  const state={nextTieAsset:'BTC' as const},input=[laterEth,eth,laterBtc,btc],r=coordinateEntryBatch(input,time,state);
  expect(r.opportunities).toEqual([btc,eth,laterEth,laterBtc]);expect(r.nextState).toEqual(state);
  expect(r.audit.ties.map(t=>t.preferredAsset)).toEqual(['BTC','ETH']);
  expect(coordinateEntryBatch([...input].reverse(),time,state)).toEqual(r);
});
test('same input/state replays identically; next state is not an automatic persistent update',()=>{
  const state={nextTieAsset:'BTC' as const},before=JSON.stringify(state),first=coordinateEntryBatch([btc,eth],time,state);
  expect(coordinateEntryBatch([eth,btc],time,state)).toEqual(first);expect(JSON.stringify(state)).toBe(before);
  expect(coordinateEntryBatch([btc,eth],time,first.nextState).opportunities[0]!.asset).toBe('ETH');
});

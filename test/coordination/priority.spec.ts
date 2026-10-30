import { compareEntryPriority, priorityCriterion } from '../../src/coordination/priority';
import { prepareSimulatedDecision, DecisionEnvelope } from '../../src/operations';
import { ActivePolicy, ContextFeed } from '../../src/signals/types';
import { Candle } from '../../src/simulation/candle';

function entry(asset:'BTC'|'ETH',score:75|80,day=1,version='1',volume='150.00000000'):DecisionEnvelope {
  const candles:Candle[]=Array.from({length:1803},(_,i)=>{const p=i===1800||i===1801?80:100;
    return {asset,openTime:new Date(Date.UTC(2026,0,day)+i*300000).toISOString(),closeTime:new Date(Date.UTC(2026,0,day)+(i+1)*300000).toISOString(),
      open:`${p}.00000000`,close:`${p}.00000000`,high:`${i===1802&&score===80?p:p+3}.00000000`,low:`${p-3}.00000000`,volume:i===1802?volume:'100.00000000'};});
  const asOf=candles.at(-1)!.closeTime;
  const policy:ActivePolicy={id:`${asset}-P0`,asset,version,state:'UNVALIDATED',families:['TREND','BREAKOUT','MEAN_REVERSION'].map(family=>({family:family as 'TREND'|'BREAKOUT'|'MEAN_REVERSION',id:family,version:'1'}))};
  const feed:ContextFeed={status:'VALID',events:[30,score===80?20:10].map((intensity,i)=>({eventId:`e${i}`,groupId:`g${i}`,revision:1,
    previousEventId:null,source:'test',publishedAt:asOf,availableAt:asOf,sequence:i+1,category:'CRYPTO',state:'CONFIRMED',impacts:{[asset]:{direction:1,intensity}}}))} as ContextFeed;
  return prepareSimulatedDecision(candles,asOf,feed,policy,{asset,asOf,status:'FLAT'});
}
let btc:DecisionEnvelope,eth:DecisionEnvelope,lower:DecisionEnvelope,newer:DecisionEnvelope,rawLower:DecisionEnvelope,otherId:DecisionEnvelope;
beforeAll(()=>{btc=entry('BTC',80);eth=entry('ETH',80);lower=entry('ETH',75);newer=entry('BTC',80,2);rawLower=entry('ETH',80,1,'1','145.00000000');otherId=entry('BTC',80,1,'2');});
test('real D1 score80 precedes75 regardless of asset preference',()=>{
  expect(btc.candidate!.scoreRounded).toBe(80);expect(lower.candidate!.scoreRounded).toBe(75);
  expect(compareEntryPriority(btc,lower,'ETH')).toBeLessThan(0);expect(priorityCriterion(btc,lower)).toBe('SCORE_ROUNDED');
});
test('same score uses oldest signal before rotation',()=>{
  expect(compareEntryPriority(btc,newer,'ETH')).toBeLessThan(0);expect(priorityCriterion(btc,newer)).toBe('SIGNAL_TIME');
});
test.each(['BTC','ETH'] as const)('same score/time uses explicit %s preference',asset=>{
  expect(compareEntryPriority(btc,eth,asset)).toBe(asset==='BTC'?-1:1);expect(priorityCriterion(btc,eth)).toBe('ROUND_ROBIN');
});
test('canonical ID is final tie break; equal IDs compare equal',()=>{
  expect(compareEntryPriority(btc,otherId,'ETH')).toBeLessThan(0);expect(priorityCriterion(btc,otherId)).toBe('CANONICAL_ID');
  expect(compareEntryPriority(btc,btc,'BTC')).toBe(0);
});
test('different exact raw scores do not override rounded score/time/rotation',()=>{
  expect(rawLower.candidate!.scoreRounded).toBe(80);expect(rawLower.candidate!.scoreRaw).not.toEqual(btc.candidate!.scoreRaw);
  expect(compareEntryPriority(rawLower,btc,'ETH')).toBeLessThan(0);
});

import { exactTechnicalScores,deserialize,compare,rational } from '../../src/signals/exact-technical-score';
import { Candle,toDecimalString as dec } from '../../src/simulation/candle';
import { TECHNICAL_FAMILIES,TechnicalAssessment } from '../../src/strategies';
const q=(n:number|string,d:number|string=1)=>({numerator:String(n),denominator:String(d)});
function candles(values:readonly bigint[],wick=100_000_000n):Candle[]{
  return values.map((c,i)=>({asset:'BTC',openTime:new Date(Date.UTC(2026,0,1)+i*300_000).toISOString(),closeTime:new Date(Date.UTC(2026,0,1)+(i+1)*300_000).toISOString(),
    open:dec(c),close:dec(c),high:dec(c+wick),low:dec(c-wick),volume:'100.00000000'}));
}
function assessments(input:readonly Candle[],G:0|1=0):TechnicalAssessment[]{
  return TECHNICAL_FAMILIES.map(family=>({asset:input.at(-1)!.asset,closeTime:input.at(-1)!.closeTime,regimeCloseTime:null,family,
    confirmedRegime:'UNKNOWN',volatility:'UNKNOWN',warmupComplete:false,triggerMet:G===1,G,F:null,Q:null,V:null,T:99.999999,
    technicalEligible:false,reason:'WARMUP_INCOMPLETE'}));
}
const base=10_000_000_000n;
function sixty(closeTick=0n,volumeTick=0n):Candle[]{
  const input=candles([...Array<bigint>(21).fill(base),base-2_000_000_000n,base-200_000_000n+closeTick]);
  input[22]={...input[22]!,high:'98.00000000',low:'94.00000000',volume:dec(10_000_000_000n+volumeTick)};
  return input;
}
test('exact T60 and rational neighbours; caller Number T is ignored',()=>{
  for(const [input,expected,side] of [[sixty(),q(60),0],[sixty(-1n),q(1199999999,20000000),-1],[sixty(0n,1n),q('30000000001',500000000),1]] as const){
    const result=exactTechnicalScores(input,assessments(input,1))[0]!;
    expect(result).toMatchObject({F:q(0),V:input.at(-1)!.volume==='100.00000000'?q(0):q(1,5000000000),T:expected});
    expect(compare(deserialize(result.T!),rational(60n))).toBe(side);
  }
});
test('linear EMA9/21 spread0.6 and ATR6 give F1/5 exactly at normal and60000 baseline',()=>{
  for(const start of [base,6_000_000_000_000n]){
    const input=candles(Array.from({length:50},(_,i)=>start+BigInt(i)*10_000_000n),300_000_000n);
    expect(exactTechnicalScores(input,assessments(input))[0]).toMatchObject({F:q(1,5),Q:q(1,2),V:q(0),T:q(16)});
  }
});
test('breakout Wilder ATR15/7 yields F14/15, Q1/2,V1/2,T83',()=>{
  const input=candles([...Array<bigint>(21).fill(base),base+200_000_000n]);
  input[21]={...input[21]!,high:'104.00000000',low:'100.00000000',volume:'125.00000000'};
  expect(exactTechnicalScores(input,assessments(input,1))[1]).toMatchObject({F:q(14,15),Q:q(1,2),V:q(1,2),T:q(83)});
});
test('RSI gain/loss3/7 seed is30 and stays30 during flat Wilder steps: F1/3,T20',()=>{
  const input=candles([base,base+300_000_000n,...Array<bigint>(23).fill(base-400_000_000n)]);
  expect(exactTechnicalScores(input,assessments(input))[2]).toMatchObject({F:q(1,3),T:q(20)});
});
test('nonflat Wilder updates and previous-three indexing have an independent rational reference',()=>{
  // Seed gains3/losses7; t15 gain1, t16 loss5, t17 gain1.
  // RSI16=100*689/(689+2163)=17225/713 is the previous minimum.
  // Current t18 loss20 must not enter F: (35-17225/713)/15=1546/2139.
  const input=candles([base,base+300000000n,...Array<bigint>(13).fill(base-400000000n),
    base-300000000n,base-800000000n,base-700000000n,base-2700000000n]);
  expect(exactTechnicalScores(input,assessments(input))[2]!.F).toEqual(q(1546,2139));
});
test('approved RSI zero, fifty and hundred conventions remain exact',()=>{
  for(const [direction,F] of [[-1n,q(1)],[0n,q(0)],[1n,q(0)]] as const){
    const input=candles(Array.from({length:25},(_,i)=>base+direction*BigInt(i)*10000000n));
    expect(exactTechnicalScores(input,assessments(input))[2]!.F).toEqual(F);
  }
});
test('zero divisors, insufficient indicators and invalid assessment identity are explicit',()=>{
  const flat=candles(Array<bigint>(25).fill(base),0n);
  for(const result of exactTechnicalScores(flat,assessments(flat))){expect(result.T).toBeNull();expect(result.reasons).toContain('ZERO_ATR');expect(result.Q).toBeNull();}
  const early=candles(Array<bigint>(10).fill(base));
  expect(exactTechnicalScores(early,assessments(early)).every(a=>a.T===null)).toBe(true);
  const zeroVolume=candles(Array<bigint>(25).fill(base)).map(c=>({...c,volume:'0.00000000'}));
  expect(exactTechnicalScores(zeroVolume,assessments(zeroVolume))[0]!.reasons).toContain('ZERO_VOLUME_MEAN');
  expect(()=>exactTechnicalScores(flat,[])).toThrow(RangeError);
  expect(()=>exactTechnicalScores(flat,assessments(flat).map(a=>({...a,asset:'ETH'})))).toThrow(RangeError);
});
test('component clipping, serializable output, deterministic prefixes and immutable input',()=>{
  const input=Object.freeze(candles(Array.from({length:45},(_,i)=>base+BigInt(i)*100_000_000n)).map(c=>Object.freeze(c)));
  const before=JSON.stringify(input);
  const result=exactTechnicalScores(input,assessments(input));
  expect(result[0]!.F).toEqual(q(1));expect(result[1]!.F).toEqual(q(0));
  expect(()=>JSON.stringify(result)).not.toThrow();expect(Object.isFrozen(result)).toBe(true);
  for(const size of [21,30,40]){
    const prefix=input.slice(0,size),reference=exactTechnicalScores(prefix,assessments(prefix));
    expect(exactTechnicalScores([...input].slice(0,size),assessments(prefix))).toEqual(reference);
  }
  expect(JSON.stringify(input)).toBe(before);
});

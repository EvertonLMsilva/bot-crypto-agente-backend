import { Candle } from '../simulation/candle';
import { ExactTriggerPoint } from './types';

const relation = (value: bigint): -1 | 0 | 1 => value < 0n ? -1 : value > 0n ? 1 : 0;

/** Caller validates OHLCV, continuity, asset and asOf. All price/volume decisions
 * use original eight-place integers. One pass keeps current rational EMA/Wilder
 * states and a rolling20 window; output contains only bounded-size certificates.
 */
export function exactTriggers(candles: readonly Candle[]): readonly ExactTriggerPoint[] {
  const units = (value: string): bigint => BigInt(value.replace('.', ''));
  const window: { close: bigint; high: bigint; volume: bigint }[] = [];
  const previousRSI: (-1 | 0 | 1)[] = [];
  const result: ExactTriggerPoint[] = [];
  let sumClose = 0n, sumSquares = 0n, sumVolume = 0n;
  let emaN = 0n, emaD = 1n, emaSeed = 0n;
  let gainN = 0n, lossN = 0n, wilderD = 14n;
  let previousClose: bigint | null = null;
  let previousRelation: ExactTriggerPoint['trendRelation'] = null;
  let previousBand: ExactTriggerPoint['bandPosition'] = null;
  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i]!, close = units(candle.close), high = units(candle.high), volume = units(candle.volume);
    let trendRelation: ExactTriggerPoint['trendRelation'] = null;
    if (i < 9) emaSeed += close;
    if (i === 8) { emaN = emaSeed; emaD = 9n; }
    else if (i > 8) { emaN = 4n * emaN + close * emaD; emaD *= 5n; }
    if (i >= 8) {
      if (emaN % emaD === 0n) { emaN /= emaD; emaD = 1n; }
      trendRelation = relation(close * emaD - emaN);
    }
    const trend = previousRelation === null || trendRelation === null ? null
      : previousRelation <= 0 && trendRelation > 0;
    let rsi35: ExactTriggerPoint['rsi35'] = null;
    if (previousClose !== null) {
      const change = close - previousClose;
      const gain = change > 0n ? change : 0n, loss = change < 0n ? -change : 0n;
      if (i <= 14) { gainN += gain; lossN += loss; }
      else {
        gainN = 13n * gainN + gain * wilderD;
        lossN = 13n * lossN + loss * wilderD;
        wilderD *= 14n;
      }
      if (i >= 14) {
        if (gainN % wilderD === 0n && lossN % wilderD === 0n) {
          gainN /= wilderD; lossN /= wilderD; wilderD = 1n;
        }
        // RSI=100*g/(g+l), so RSI35 compares13*g with7*l.
        // Flat Wilder averages have the approved RSI50, not RSI35.
        rsi35 = gainN === 0n && lossN === 0n ? 1 : relation(13n * gainN - 7n * lossN);
      }
    }
    const previousHigh = window.length === 20 ? window.reduce((a, c) => c.high > a ? c.high : a, 0n) : null;
    const previousVolumeSum = window.length === 20 ? sumVolume : null;
    const breakout = previousHigh === null || previousVolumeSum === null ? null
      : previousVolumeSum > 0n && close > previousHigh && 50n * volume > 3n * previousVolumeSum;
    if (window.length === 20) {
      const removed = window.shift()!;
      sumClose -= removed.close; sumSquares -= removed.close * removed.close; sumVolume -= removed.volume;
    }
    window.push({ close, high, volume });
    sumClose += close; sumSquares += close * close; sumVolume += volume;
    let bandPosition: ExactTriggerPoint['bandPosition'] = null;
    if (window.length === 20) {
      const delta = 20n * close - sumClose;
      // Population variance=(20*sum(x²)-sum(x)²)/400. Comparing
      // delta² with4*varianceNumerator removes sqrt and denominators.
      const outside = delta * delta > 4n * (20n * sumSquares - sumClose * sumClose);
      bandPosition = outside ? delta < 0n ? 'BELOW' : 'ABOVE' : 'WITHIN';
    }
    const meanReversion = rsi35 === null || previousRSI.length < 3 || previousBand === null || bandPosition === null ? null
      : previousRSI[previousRSI.length - 1]! <= 0 && rsi35 > 0 && previousRSI.some(value => value < 0)
        && previousBand === 'BELOW' && bandPosition === 'WITHIN';
    result.push(Object.freeze({ trend, breakout, meanReversion, trendRelation, rsi35, bandPosition, previousHigh, previousVolumeSum }));
    previousRelation = trendRelation; previousBand = bandPosition; previousClose = close;
    if (rsi35 !== null) { previousRSI.push(rsi35); if (previousRSI.length > 3) previousRSI.shift(); }
  }
  return Object.freeze(result);
}

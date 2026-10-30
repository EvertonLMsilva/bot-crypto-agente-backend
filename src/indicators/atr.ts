import { Candle } from '../simulation/candle';
import { IndicatorSeries, IndicatorTimeframe, NumericCandle } from './types';
import { finiteResult, validateHistory } from './validation';

/** t >= 1 only: previous close is mandatory, including gaps in market prices. */
export function trueRange(current: NumericCandle, previous: NumericCandle): number {
  return Math.max(current.high - current.low,
    Math.abs(current.high - previous.close), Math.abs(current.low - previous.close));
}

export function atr(candles: readonly Candle[], asOf: string, timeframe: IndicatorTimeframe = '5m'): IndicatorSeries {
  const data = validateHistory(candles, asOf, timeframe);
  const result: (number | null)[] = Array(data.length).fill(null);
  let average = 0;
  for (let i = 1; i < data.length; i++) {
    const tr = trueRange(data[i]!, data[i - 1]!);
    average = finiteResult(average + (tr - average) / (i <= 14 ? i : 14));
    // Zero is a valid ATR measurement, never permission to divide by zero.
    if (i >= 14) result[i] = average;
  }
  return result;
}

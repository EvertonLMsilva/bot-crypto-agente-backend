import { Candle } from '../simulation/candle';
import { EmaPeriod, IndicatorSeries } from './types';
import { finiteResult, validateHistory } from './validation';

export function ema(candles: readonly Candle[], asOf: string, period: EmaPeriod): IndicatorSeries {
  if (![9, 20, 21, 50].includes(period)) throw new RangeError('Unsupported EMA period');
  const data = validateHistory(candles, asOf);
  const result: (number | null)[] = Array(data.length).fill(null);
  let average = 0;
  for (let i = 0; i < data.length; i++) {
    const close = data[i]!.close;
    // Incremental mean avoids overflowing a sum of otherwise finite prices.
    average = finiteResult(average + (close - average) * (i < period ? 1 / (i + 1) : 2 / (period + 1)));
    if (i >= period - 1) result[i] = average;
  }
  return result;
}

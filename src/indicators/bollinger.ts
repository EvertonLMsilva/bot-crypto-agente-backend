import { Candle } from '../simulation/candle';
import { BollingerPoint, IndicatorSeries } from './types';
import { finiteResult, validateHistory } from './validation';

export function bollinger(candles: readonly Candle[], asOf: string): IndicatorSeries<BollingerPoint> {
  const data = validateHistory(candles, asOf);
  const result: (BollingerPoint | null)[] = Array(data.length).fill(null);
  for (let i = 19; i < data.length; i++) {
    let middle = 0;
    for (let j = 0; j < 20; j++) middle += (data[i - 19 + j]!.close - middle) / (j + 1);
    let variance = 0;
    for (let j = i - 19; j <= i; j++) variance += (data[j]!.close - middle) ** 2 / 20;
    const width = 2 * Math.sqrt(finiteResult(variance));
    result[i] = { middle: finiteResult(middle),
      upper: finiteResult(middle + width), lower: finiteResult(middle - width) };
  }
  return result;
}

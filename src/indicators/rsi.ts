import { Candle } from '../simulation/candle';
import { IndicatorSeries } from './types';
import { finiteResult, validateHistory } from './validation';

export function rsi(candles: readonly Candle[], asOf: string): IndicatorSeries {
  const data = validateHistory(candles, asOf);
  const result: (number | null)[] = Array(data.length).fill(null);
  let gain = 0, loss = 0;
  for (let i = 1; i < data.length; i++) {
    const change = data[i]!.close - data[i - 1]!.close;
    const divisor = i <= 14 ? i : 14;
    gain += (Math.max(change, 0) - gain) / divisor;
    loss += (Math.max(-change, 0) - loss) / divisor;
    if (i >= 14) {
      // Ratio form avoids overflow from gain/loss for very small loss.
      const value = loss === 0 ? (gain === 0 ? 50 : 100)
        : gain === 0 ? 0 : 100 / (1 + loss / gain);
      result[i] = finiteResult(value);
    }
  }
  return result;
}

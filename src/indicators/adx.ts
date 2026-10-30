import { Candle } from '../simulation/candle';
import { trueRange } from './atr';
import { AdxPoint, IndicatorSeries } from './types';
import { finiteResult, validateHistory } from './validation';

export function adx(candles: readonly Candle[], asOf: string): IndicatorSeries<AdxPoint> {
  const data = validateHistory(candles, asOf);
  const result: (AdxPoint | null)[] = Array(data.length).fill(null);
  let range = 0, plus = 0, minus = 0, strength = 0;
  for (let i = 1; i < data.length; i++) {
    const current = data[i]!, previous = data[i - 1]!;
    const up = current.high - previous.high;
    const down = previous.low - current.low;
    const divisor = i <= 14 ? i : 14;
    // Strict comparisons make a directional tie zero on BOTH sides.
    plus += ((up > down && up > 0 ? up : 0) - plus) / divisor;
    minus += ((down > up && down > 0 ? down : 0) - minus) / divisor;
    range += (trueRange(current, previous) - range) / divisor;
    if (i >= 14) {
      const plusDI = finiteResult(range === 0 ? 0 : 100 * (plus / range));
      const minusDI = finiteResult(range === 0 ? 0 : 100 * (minus / range));
      const sum = plusDI + minusDI;
      const dx = finiteResult(sum === 0 ? 0 : 100 * (Math.abs(plusDI - minusDI) / sum));
      // Mean of DX[14..27] seeds ADX; then Wilder on later DX values.
      strength = finiteResult(strength + (dx - strength) / (i <= 27 ? i - 13 : 14));
      result[i] = { plusDI, minusDI, dx, adx: i >= 27 ? strength : null };
    }
  }
  return result;
}

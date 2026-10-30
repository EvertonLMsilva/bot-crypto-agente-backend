import { validateHistory } from '../indicators';
import { Candle, toDecimalString } from '../simulation/candle';

/** Complete UTC hours only. Invalid data, including an incomplete suffix, rejects
 * the entire request; callers must supply a closed prefix at the explicit asOf.
 */
export function aggregateClosedHours(candles5m: readonly Candle[], asOf: string): readonly Candle[] {
  validateHistory(candles5m, asOf);
  if (candles5m.length > 0 && Date.parse(candles5m[0]!.openTime) % 3_600_000 !== 0) {
    throw new RangeError('Hourly history must begin at a full UTC hour');
  }
  const result: Candle[] = [];
  const units = (value: string): bigint => BigInt(value.replace('.', ''));
  for (let i = 0; i + 12 <= candles5m.length; i += 12) {
    const first = candles5m[i]!, last = candles5m[i + 11]!;
    let high = units(first.high), low = units(first.low), volume = 0n;
    for (let j = i; j < i + 12; j++) {
      const candle = candles5m[j]!, h = units(candle.high), l = units(candle.low);
      if (h > high) high = h;
      if (l < low) low = l;
      volume += units(candle.volume);
    }
    result.push(Object.freeze({ asset: first.asset, openTime: new Date(first.openTime).toISOString(),
      closeTime: new Date(last.closeTime).toISOString(), open: first.open, close: last.close,
      high: toDecimalString(high), low: toDecimalString(low), volume: toDecimalString(volume) }));
  }
  return Object.freeze(result);
}

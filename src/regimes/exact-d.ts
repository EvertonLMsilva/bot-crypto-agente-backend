import { Candle } from '../simulation/candle';
import { ExactDComparison, Rational } from './types';

function fraction(numerator: bigint, denominator: bigint): Rational {
  let a = numerator < 0n ? -numerator : numerator, b = denominator;
  while (b !== 0n) { const rest = a % b; a = b; b = rest; }
  return Object.freeze({ numerator: numerator / a, denominator: denominator / a });
}

export function compareRationals(a: Rational, b: Rational): -1 | 0 | 1 {
  const difference = a.numerator * b.denominator - b.numerator * a.denominator;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}

function update(previous: Rational, value: bigint, weight: bigint, divisor: bigint): Rational {
  return fraction(previous.numerator * weight + value * previous.denominator, previous.denominator * divisor);
}

function prices(candle: Candle): { high: bigint; low: bigint; close: bigint } | null {
  if (!candle) return null;
  const fields = [candle.open, candle.high, candle.low, candle.close];
  if (fields.some(value => typeof value !== 'string' || !/^(0|[1-9]\d*)\.\d{8}$/.test(value))) return null;
  const [open, high, low, close] = fields.map(value => BigInt(value.replace('.', '')));
  if (low! <= 0n || open! < low! || close! < low! || high! < open! || high! < close!) return null;
  return { high: high!, low: low!, close: close! };
}

/** Input chronology, asset and asOf are validated by the caller. No Number price
 * arithmetic. One pass keeps only current rational states; invalid OHLC resets them.
 * The exact ATR already needed by D also certifies volatility comparisons.
 */
export function* exactMetrics(candles: readonly Candle[]): Generator<{
  readonly comparison: ExactDComparison; readonly ratio: Rational | null;
}> {
  let count = 0, sum20 = 0n, sum50 = 0n, sumTR = 0n;
  let fast: Rational | null = null, slow: Rational | null = null, range: Rational | null = null;
  let previous: ReturnType<typeof prices> = null;
  for (const candle of candles) {
    const current = prices(candle);
    if (!current) {
      count = 0; sum20 = 0n; sum50 = 0n; sumTR = 0n;
      fast = null; slow = null; range = null; previous = null;
      yield { comparison: 'UNAVAILABLE', ratio: null };
      continue;
    }
    count++;
    if (count <= 20) sum20 += current.close;
    if (count <= 50) sum50 += current.close;
    if (count === 20) fast = fraction(sum20, 20n);
    else if (fast) fast = update(fast, 2n * current.close, 19n, 21n);
    if (count === 50) slow = fraction(sum50, 50n);
    else if (slow) slow = update(slow, 2n * current.close, 49n, 51n);
    if (previous) {
      const abs = (value: bigint): bigint => value < 0n ? -value : value;
      const ranges = [current.high - current.low, abs(current.high - previous.close), abs(current.low - previous.close)];
      const tr = ranges.reduce((a, b) => a > b ? a : b);
      if (count <= 15) sumTR += tr;
      if (count === 15) range = fraction(sumTR, 14n);
      else if (range) range = update(range, tr, 13n, 14n);
    }
    previous = current;
    let comparison: ExactDComparison = 'UNAVAILABLE';
    if (fast && slow && range && range.numerator > 0n) {
      const spread = fast.numerator * slow.denominator - slow.numerator * fast.denominator;
      const left = 4n * spread * range.denominator;
      const right = range.numerator * fast.denominator * slow.denominator;
      comparison = left >= right ? 'POSITIVE_THRESHOLD_MET'
        : left <= -right ? 'NEGATIVE_THRESHOLD_MET' : 'BETWEEN_THRESHOLDS';
    }
    yield { comparison, ratio: range && range.numerator > 0n
      ? fraction(range.numerator, range.denominator * current.close) : null };
  }
}

export function compareExactD(candles: readonly Candle[]): readonly ExactDComparison[] {
  return Object.freeze(Array.from(exactMetrics(candles), point => point.comparison));
}

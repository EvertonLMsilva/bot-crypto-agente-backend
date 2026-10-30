import { adx, atr, ema } from '../indicators';
import { Candle, toDecimalString } from '../simulation/candle';
import { aggregateClosedHours } from './aggregate-hourly';
import { compareRationals, exactMetrics } from './exact-d';
import { ExactDComparison, HourlyClassification, MarketRegime, Rational, VolatilityRegime } from './types';

interface Bounds { readonly lower: number; readonly upper: number }
/** Enclosures of exact Wilder ADX and smoothed directional movements. The common
 * positive TR denominator cancels when comparing +DI with -DI.
 */
export interface DirectionalEvidence { readonly adx: Bounds; readonly plus: Bounds; readonly minus: Bounds }
const ZERO: Bounds = Object.freeze({ lower: 0, upper: 0 });

// Adjacent non-negative binary64 values, not a tolerance or a changed threshold.
function adjacent(value: number, upward: boolean): number {
  if (value === 0) return upward ? Number.MIN_VALUE : 0;
  if (value === Infinity) return upward ? Infinity : Number.MAX_VALUE;
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  view.setBigUint64(0, view.getBigUint64(0) + (upward ? 1n : -1n));
  return view.getFloat64(0);
}

function enclosure(lower: number, upper: number): Bounds {
  return { lower: adjacent(Math.max(0, lower), false), upper: adjacent(upper, true) };
}

function exactInput(units: bigint): Bounds {
  if (units === 0n) return ZERO;
  const value = Number(toDecimalString(units));
  return enclosure(value, value);
}

function smooth(previous: Bounds, current: Bounds, divisor: number): Bounds {
  if (previous.upper === 0 && current.upper === 0) return ZERO;
  if (divisor === 1) return current;
  const weighted = enclosure(previous.lower * (divisor - 1), previous.upper * (divisor - 1));
  const sum = enclosure(weighted.lower + current.lower, weighted.upper + current.upper);
  return enclosure(sum.lower / divisor, sum.upper / divisor);
}

/** Rounding enclosures certify ADX/DI decisions without altering their existing
 * Number implementations. Exact OHLC differences select DM (including ties).
 * Every remaining floating-point operation is rounded outward by one binary64
 * neighbour; a straddled threshold cannot be used to classify a regime.
 */
function* directionalCertificates(candles: readonly Candle[]): Generator<DirectionalEvidence | null> {
  let plus = ZERO, minus = ZERO, strength = ZERO;
  const units = (value: string): bigint => BigInt(value.replace('.', ''));
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) { yield null; continue; }
    const current = candles[i]!, previous = candles[i - 1]!;
    const up = units(current.high) - units(previous.high), down = units(previous.low) - units(current.low);
    plus = smooth(plus, exactInput(up > down && up > 0n ? up : 0n), i <= 14 ? i : 14);
    minus = smooth(minus, exactInput(down > up && down > 0n ? down : 0n), i <= 14 ? i : 14);
    if (i < 14) { yield null; continue; }
    let dx: Bounds;
    if (plus.upper === 0 && minus.upper === 0) dx = ZERO;
    else {
      const sum = enclosure(plus.lower + minus.lower, plus.upper + minus.upper);
      if (sum.lower === 0 || !Number.isFinite(sum.upper)) dx = { lower: 0, upper: 100 };
      else {
        const difference = enclosure(Math.max(0, plus.lower - minus.upper, minus.lower - plus.upper),
          Math.max(plus.upper - minus.lower, minus.upper - plus.lower));
        const ratio = enclosure(difference.lower / sum.upper, difference.upper / sum.lower);
        dx = enclosure(ratio.lower * 100, ratio.upper * 100);
      }
    }
    strength = smooth(strength, dx, i <= 27 ? i - 13 : 14);
    yield i >= 27 ? { adx: strength, plus, minus } : null;
  }
}

/** Pure decision on certified bounds. Overlap is UNKNOWN, never an epsilon. */
export function classifyRegime(d: ExactDComparison, evidence: DirectionalEvidence | null): MarketRegime {
  if (d === 'UNAVAILABLE' || evidence === null) return 'UNKNOWN';
  for (const value of [evidence.adx, evidence.plus, evidence.minus]) {
    if (!Number.isFinite(value.lower) || !Number.isFinite(value.upper)
      || value.lower < 0 || value.lower > value.upper) return 'UNKNOWN';
  }
  if (evidence.adx.upper < 20) return 'SIDEWAYS';
  if (evidence.adx.lower >= 25) {
    if (d === 'POSITIVE_THRESHOLD_MET' && evidence.plus.lower > evidence.minus.upper) return 'UPTREND';
    if (d === 'NEGATIVE_THRESHOLD_MET' && evidence.minus.lower > evidence.plus.upper) return 'DOWNTREND';
  }
  return 'UNKNOWN';
}

function observable(value: number | null): number | null {
  return value !== null && Number.isFinite(value) ? value : null;
}

/** Structural data errors reject with RangeError (no stale result or warmup).
 * Indicators/decision uncertainty return UNKNOWN. No signals or authorization.
 */
export function classifyHourly(candles5m: readonly Candle[], asOf: string): readonly HourlyClassification[] {
  const hours = aggregateClosedHours(candles5m, asOf);
  const fast = ema(hours, asOf, 20, '1h'), slow = ema(hours, asOf, 50, '1h');
  const ranges = atr(hours, asOf, '1h'), directional = adx(hours, asOf, '1h');
  const metrics = exactMetrics(hours), certificates = directionalCertificates(hours);
  const reference: { exact: Rational; approximate: number }[] = [];
  const result: HourlyClassification[] = [];
  let previousRaw: MarketRegime = 'UNKNOWN';
  for (let i = 0; i < hours.length; i++) {
    const candle = hours[i]!, metric = metrics.next().value!, certificate = certificates.next().value!;
    const rawRegime = classifyRegime(metric.comparison, certificate);
    const confirmedRegime = rawRegime !== 'UNKNOWN' && rawRegime === previousRaw ? rawRegime : 'UNKNOWN';
    previousRaw = rawRegime;
    const range = ranges[i]!, ema20 = fast[i]!, ema50 = slow[i]!, dm = directional[i]!;
    const d = range !== null && range > 0 && ema20 !== null && ema50 !== null
      ? observable((ema20 - ema50) / range) : null;
    const ratio = range !== null && range > 0 ? observable(range / Number(candle.close)) : null;
    let volatility: VolatilityRegime = 'UNKNOWN', p75: number | null = null;
    if (metric.ratio !== null && ratio !== null) {
      if (reference.length === 100) {
        const ranked = [...reference].sort((a, b) => compareRationals(a.exact, b.exact));
        const threshold = ranked[74]!;
        p75 = threshold.approximate;
        volatility = compareRationals(metric.ratio, threshold.exact) > 0 ? 'HIGH' : 'NORMAL';
      }
      reference.push({ exact: metric.ratio, approximate: ratio });
      if (reference.length > 100) reference.shift();
    } else reference.length = 0;
    result.push(Object.freeze({ closeTime: candle.closeTime, rawRegime, confirmedRegime, volatility,
      warmupComplete: i >= 149, ema20, ema50, atr14: range, adx14: dm?.adx ?? null,
      plusDI: dm?.plusDI ?? null, minusDI: dm?.minusDI ?? null, d, exactD: metric.comparison,
      volatilityRatio: ratio, volatilityP75: p75,
      reason: metric.comparison === 'UNAVAILABLE' ? 'INSUFFICIENT_HISTORY_OR_ZERO_ATR'
        : rawRegime === 'UNKNOWN' ? 'INTERMEDIATE_CONTRADICTORY_OR_NUMERICALLY_UNCERTAIN'
        : confirmedRegime === 'UNKNOWN' ? 'AWAITING_SECOND_CONSECUTIVE_HOUR' : null }));
  }
  return Object.freeze(result);
}

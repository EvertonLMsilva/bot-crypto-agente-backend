import { Candle, toDecimalString } from '../simulation/candle';
import { AssessmentReason, TechnicalComponents, TechnicalFamily } from './types';

export interface TechnicalInput {
  readonly family: TechnicalFamily;
  readonly G: 0 | 1;
  readonly candle: Candle;
  readonly ema9: number | null;
  readonly ema21: number | null;
  readonly atr14: number | null;
  readonly minimumPreviousRSI: number | null;
  readonly previousHigh: bigint | null;
  readonly previousVolumeSum: bigint | null;
}
export type EvidenceReason = 'OK' | Extract<AssessmentReason, 'INDICATORS_UNAVAILABLE' | 'ATR_NOT_POSITIVE'
  | 'PRICE_RANGE_NOT_POSITIVE' | 'VOLUME_AVERAGE_NOT_POSITIVE' | 'INVALID_COMPONENT'>;

/** Approximate statistics only. Bounds are decided exactly before converting a
 * bounded fraction. Leading decimal digits avoid Infinity/Infinity on large
 * canonical inputs; this value never decides a trigger or a score threshold.
 */
function clippedRatio(numerator: bigint, denominator: bigint): number {
  if (numerator <= 0n) return 0;
  if (numerator >= denominator) return 1;
  const n = numerator.toString(), d = denominator.toString();
  const ns = n.slice(0, 17), ds = d.slice(0, 17);
  return Math.min(1, (Number(ns) / Number(ds)) * 10 ** (n.length - ns.length - d.length + ds.length));
}

const clip = (value: number): number => Math.max(0, Math.min(1, value));

/** Input candle has already passed validateHistory. Null means an unavailable
 * component, never a substituted numeric default. No rounding of T.
 */
export function technicalEvidence(input: TechnicalInput): Readonly<TechnicalComponents & { reason: EvidenceReason }> {
  let reason: EvidenceReason = 'OK';
  const fail = (code: EvidenceReason): void => { if (reason === 'OK') reason = code; };
  const units = (value: string): bigint => BigInt(value.replace('.', ''));
  const { candle, atr14, family, ema9, ema21, minimumPreviousRSI, previousHigh, previousVolumeSum } = input;
  const close = units(candle.close), high = units(candle.high), low = units(candle.low), volume = units(candle.volume);
  const validATR = atr14 !== null && Number.isFinite(atr14) && atr14 > 0;
  if (!validATR) fail(atr14 === null ? 'INDICATORS_UNAVAILABLE' : !Number.isFinite(atr14) ? 'INVALID_COMPONENT' : 'ATR_NOT_POSITIVE');
  const Q = high > low ? clippedRatio(close - low, high - low) : null;
  if (Q === null) fail('PRICE_RANGE_NOT_POSITIVE');
  const V = previousVolumeSum !== null && previousVolumeSum > 0n
    ? clippedRatio(40n * volume - 2n * previousVolumeSum, previousVolumeSum) : null;
  if (V === null) fail(previousVolumeSum === null ? 'INDICATORS_UNAVAILABLE' : 'VOLUME_AVERAGE_NOT_POSITIVE');
  let F: number | null = null;
  if (validATR) {
    if (family === 'MEAN_REVERSION') {
      if (minimumPreviousRSI === null) fail('INDICATORS_UNAVAILABLE');
      else if (!Number.isFinite(minimumPreviousRSI) || minimumPreviousRSI < 0 || minimumPreviousRSI > 100) fail('INVALID_COMPONENT');
      else F = clip((35 - minimumPreviousRSI) / 15);
    } else {
      let spread: number | null = null;
      if (family === 'TREND') {
        if (ema9 === null || ema21 === null) fail('INDICATORS_UNAVAILABLE');
        else if (!Number.isFinite(ema9) || !Number.isFinite(ema21)) fail('INVALID_COMPONENT');
        else spread = ema9 - ema21;
      } else if (previousHigh === null) fail('INDICATORS_UNAVAILABLE');
      else spread = close <= previousHigh ? 0 : Number(toDecimalString(close - previousHigh));
      if (spread !== null) {
        const divisor = atr14! / 2;
        if (!Number.isFinite(spread) || divisor <= 0) fail('INVALID_COMPONENT');
        else F = spread <= 0 ? 0 : spread >= divisor ? 1 : spread / divisor;
      }
    }
  }
  const T = reason === 'OK' && F !== null && Q !== null && V !== null ? 40 * input.G + 30 * F + 20 * Q + 10 * V : null;
  if (T !== null && (!Number.isFinite(T) || T < 0 || T > 100)) {
    return Object.freeze({ F, Q, V, T: null, reason: 'INVALID_COMPONENT' });
  }
  return Object.freeze({ F, Q, V, T, reason });
}

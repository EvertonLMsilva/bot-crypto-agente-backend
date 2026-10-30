import { atr, bollinger, ema, rsi, validateHistory } from '../indicators';
import { classifyHourly } from '../regimes';
import { Candle } from '../simulation/candle';
import { exactTriggers } from './exact-triggers';
import { technicalEvidence } from './technical-evidence';
import { AssessmentReason, TECHNICAL_FAMILIES, TechnicalAssessment } from './types';

/** Structural errors are rejected before this helper. Statistical RangeError is
 * explicit unavailability, not substituted numeric evidence. Other errors escape.
 */
function observe<T>(calculate: () => readonly (T | null)[], length: number): readonly (T | null)[] {
  try { return calculate(); }
  catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return Array<T | null>(length).fill(null);
  }
}

/** Exactly three assessments for the latest closed snapshot, in canonical family
 * order. Trigger certificates are independent of contextual eligibility. No
 * decision here compares T to60, computes a global score or authorizes capital.
 */
export function evaluateTechnicalStrategies(candles5m: readonly Candle[], asOf: string): readonly TechnicalAssessment[] {
  validateHistory(candles5m, asOf);
  const candle = candles5m.at(-1);
  if (!candle || Date.parse(candle.closeTime) !== Date.parse(asOf)) {
    throw new RangeError('asOf must equal the last received candle close; non-empty history required');
  }
  const hourly = classifyHourly(candles5m, asOf);
  const context = hourly.at(-1) ?? null;
  const count = candles5m.length, point = exactTriggers(candles5m).at(-1)!;
  const fast = observe(() => ema(candles5m, asOf, 9), count).at(-1)!;
  const slow = observe(() => ema(candles5m, asOf, 21), count).at(-1)!;
  const ranges = observe(() => atr(candles5m, asOf), count).at(-1)!;
  const oscillators = observe(() => rsi(candles5m, asOf), count);
  const bands = observe(() => bollinger(candles5m, asOf), count);
  const previousRSIs = oscillators.slice(Math.max(0, count - 4), count - 1);
  const minimumPreviousRSI = previousRSIs.length === 3 && previousRSIs.every(value => value !== null)
    && oscillators.at(-1) !== null && bands.at(-1) !== null && bands.at(-2) !== null
    ? Math.min(...previousRSIs as number[]) : null;
  const confirmedRegime = context?.confirmedRegime ?? 'UNKNOWN';
  const volatility = context?.volatility ?? 'UNKNOWN';
  const warmupComplete = context?.warmupComplete ?? false;
  return Object.freeze(TECHNICAL_FAMILIES.map(family => {
    const trigger = family === 'TREND' ? point.trend : family === 'BREAKOUT' ? point.breakout : point.meanReversion;
    const G = trigger === true ? 1 : 0;
    const components = technicalEvidence({ family, G, candle, ema9: fast, ema21: slow, atr14: ranges,
      minimumPreviousRSI, previousHigh: point.previousHigh, previousVolumeSum: point.previousVolumeSum });
    const compatible = family === 'TREND' ? confirmedRegime === 'UPTREND'
      : family === 'BREAKOUT' ? confirmedRegime === 'UPTREND' || confirmedRegime === 'SIDEWAYS'
        : confirmedRegime === 'SIDEWAYS';
    let reason: AssessmentReason;
    if (context === null) reason = 'NO_CLOSED_HOUR';
    else if (!warmupComplete) reason = 'WARMUP_INCOMPLETE';
    else if (!compatible) reason = 'REGIME_INCOMPATIBLE';
    else if (volatility === 'UNKNOWN') reason = 'VOLATILITY_UNKNOWN';
    else if (trigger === null) reason = 'TRIGGER_UNAVAILABLE';
    else if (components.reason !== 'OK') reason = components.reason;
    else if (!trigger) reason = 'TRIGGER_NOT_MET';
    else reason = 'TECHNICALLY_ELIGIBLE';
    return Object.freeze({ asset: candle.asset, closeTime: candle.closeTime, regimeCloseTime: context?.closeTime ?? null,
      family, confirmedRegime, volatility, warmupComplete, triggerMet: trigger === true, G,
      F: components.F, Q: components.Q, V: components.V, T: components.T,
      technicalEligible: reason === 'TECHNICALLY_ELIGIBLE', reason });
  }));
}

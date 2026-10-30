export type MarketRegime = 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS' | 'UNKNOWN';
export type VolatilityRegime = 'NORMAL' | 'HIGH' | 'UNKNOWN';
export type ExactDComparison = 'POSITIVE_THRESHOLD_MET' | 'NEGATIVE_THRESHOLD_MET' | 'BETWEEN_THRESHOLDS' | 'UNAVAILABLE';
export interface Rational { readonly numerator: bigint; readonly denominator: bigint }

export interface HourlyClassification {
  readonly closeTime: string;
  readonly rawRegime: MarketRegime;
  readonly confirmedRegime: MarketRegime;
  readonly volatility: VolatilityRegime;
  readonly warmupComplete: boolean;
  readonly ema20: number | null;
  readonly ema50: number | null;
  readonly atr14: number | null;
  readonly adx14: number | null;
  readonly plusDI: number | null;
  readonly minusDI: number | null;
  /** Observability only; exactD is the decision source. */
  readonly d: number | null;
  readonly exactD: ExactDComparison;
  readonly volatilityRatio: number | null;
  readonly volatilityP75: number | null;
  readonly reason: string | null;
}

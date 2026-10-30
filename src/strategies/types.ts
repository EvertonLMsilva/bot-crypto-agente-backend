import { Asset } from '../simulation/candle';
import { MarketRegime, VolatilityRegime } from '../regimes';

export const TECHNICAL_FAMILIES = Object.freeze(['TREND', 'BREAKOUT', 'MEAN_REVERSION'] as const);
export type TechnicalFamily = typeof TECHNICAL_FAMILIES[number];
export type AssessmentReason = 'TECHNICALLY_ELIGIBLE' | 'NO_CLOSED_HOUR' | 'WARMUP_INCOMPLETE'
  | 'REGIME_INCOMPATIBLE' | 'VOLATILITY_UNKNOWN' | 'TRIGGER_UNAVAILABLE' | 'TRIGGER_NOT_MET'
  | 'INDICATORS_UNAVAILABLE' | 'ATR_NOT_POSITIVE' | 'PRICE_RANGE_NOT_POSITIVE'
  | 'VOLUME_AVERAGE_NOT_POSITIVE' | 'INVALID_COMPONENT';

export interface TechnicalComponents {
  readonly F: number | null;
  readonly Q: number | null;
  readonly V: number | null;
  readonly T: number | null;
}

/** Technical evidence only: no order, global score or financial authorization. */
export interface TechnicalAssessment extends TechnicalComponents {
  readonly asset: Asset;
  readonly closeTime: string;
  readonly regimeCloseTime: string | null;
  readonly family: TechnicalFamily;
  readonly confirmedRegime: MarketRegime;
  readonly volatility: VolatilityRegime;
  readonly warmupComplete: boolean;
  readonly triggerMet: boolean;
  readonly G: 0 | 1;
  readonly technicalEligible: boolean;
  readonly reason: AssessmentReason;
}

export interface ExactTriggerPoint {
  readonly trend: boolean | null;
  readonly breakout: boolean | null;
  readonly meanReversion: boolean | null;
  readonly trendRelation: -1 | 0 | 1 | null;
  readonly rsi35: -1 | 0 | 1 | null;
  readonly bandPosition: 'BELOW' | 'WITHIN' | 'ABOVE' | null;
  readonly previousHigh: bigint | null;
  readonly previousVolumeSum: bigint | null;
}

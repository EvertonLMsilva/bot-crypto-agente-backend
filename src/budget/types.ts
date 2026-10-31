import { Asset } from '../simulation/candle';
import { PositionView } from '../operations/types';

export type BudgetState = 'RUNNING' | 'RECOVERING' | 'ENTRY_SUSPENDED' | 'MANUAL_REVIEW_REQUIRED';
export interface BudgetSnapshot {
  readonly asOf: string;
  readonly state: BudgetState;
  readonly equity: string;
  readonly dayOpeningEquity: string;
  readonly availableCash: string;
  readonly reservedCash: string;
  readonly committedExposure: Readonly<Record<Asset, string>>;
  readonly committedRisk: string;
  readonly positions: Readonly<Record<Asset, PositionView['status']>>;
  readonly reservations: Readonly<Record<Asset, 'NONE' | 'ACTIVE' | 'UNKNOWN'>>;
}
export interface ClosedPriceReference {
  readonly asset: Asset;
  readonly closeTime: string;
  readonly close: string;
  readonly validatedClosed: boolean;
}
export type BudgetReason = `STATE_${Exclude<BudgetState, 'RUNNING'>}` | 'POSITION_OPEN' | 'POSITION_UNKNOWN'
  | 'RESERVATION_ACTIVE' | 'RESERVATION_UNKNOWN' | 'INDIVIDUAL_EXPOSURE_LIMIT' | 'TOTAL_EXPOSURE_LIMIT'
  | 'OPERATION_RISK_LIMIT' | 'OPEN_RISK_LIMIT' | 'DAILY_LOSS_LIMIT' | 'INSUFFICIENT_AVAILABLE_CASH' | 'ZERO_QUANTITY' | 'STALE_SIGNAL';
export interface BudgetLimitEvaluation {
  readonly eligible: boolean;
  readonly reasons: readonly BudgetReason[];
  readonly limits: Readonly<{
    referenceInitialCapital: string; targetExposure: string; individualExposure: string; totalExposure: string;
    operationRisk: string; openRisk: string; dailyLoss: string;
  }>;
  readonly projected: Readonly<{individualExposure: string; totalExposure: string; openRisk: string; dailyLoss: string}>;
}
export interface BudgetEstimates {
  readonly quantity: string;
  readonly exposureReference: string;
  readonly conservativeBuyPrice: string;
  readonly grossCommitment: string;
  readonly buyFee: string;
  readonly totalCommitment: string;
  readonly stopPrice: string;
  readonly stopNetReceipt: string;
  readonly plannedRisk: string;
}
/** Advisory only: independent calls do not reserve or authorize shared funds. */
export interface BudgetQuote {
  readonly decisionId: string;
  readonly rank: number;
  readonly asset: Asset;
  readonly asOf: string;
  readonly signalAsOf: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly strategyId: string;
  readonly strategyVersion: string;
  readonly price: ClosedPriceReference;
  readonly status: 'QUOTABLE' | 'NOT_QUOTABLE';
  readonly estimates: BudgetEstimates | null;
  readonly limits: BudgetLimitEvaluation;
  readonly reasons: readonly BudgetReason[];
  readonly financialAuthorization: 'NOT_EVALUATED';
  readonly reservation: 'NOT_CREATED';
  readonly execution: 'NOT_EXECUTED';
}

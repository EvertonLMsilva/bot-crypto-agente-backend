import { Asset, Candle } from '../simulation/candle';
import { AuthorizationResult, AuthorizationState, CapitalReservation, BudgetSnapshot } from '../budget';

export interface OpeningEvent { readonly asset: Asset; readonly asOf: string; readonly price: string }
/** Price numerator/denominator in fixed8 units; triggers retain sub-tick precision. */
export interface ExactPrice { readonly numerator: string; readonly denominator: string }
export interface ExecutionFill {
  readonly id: string; readonly positionId: string; readonly reservationId: string;
  readonly asset: Asset; readonly asOf: string; readonly side: 'BUY' | 'SELL'; readonly reason: string;
  readonly quantity: string; readonly reference: ExactPrice; readonly price: string;
  readonly gross: string; readonly fee: string; readonly total: string;
  readonly slippage: '0.0005'; readonly feeRate: '0.001';
}
export interface ExecutedPosition {
  readonly id: string; readonly decisionId: string; readonly reservationId: string; readonly asset: Asset;
  readonly strategyId: string; readonly strategyVersion: string; readonly quantity: string;
  readonly entryPrice: string; readonly entryCost: string; readonly plannedRisk: string;
  readonly openedAt: string; readonly closedAt: string | null; readonly status: 'OPEN' | 'CLOSED';
  readonly stop: ExactPrice; readonly take: ExactPrice; readonly realizedPnl: string;
}
export interface ExecutionReservation {
  readonly source: CapitalReservation; readonly status: 'ACTIVE' | 'SETTLED' | 'RELEASED';
  readonly terminalId: string | null;
}
export interface ExecutionOrder {
  readonly id: string; readonly decisionId: string; readonly reservationId: string; readonly quantity: string;
  readonly status: 'RESERVED' | 'FILLED' | 'CANCELLED' | 'EXPIRED'; readonly fillId: string | null;
}
export interface ExitRequest {
  readonly id: string; readonly positionId: string; readonly asset: Asset;
  readonly strategyId: string; readonly strategyVersion: string;
  readonly signalAsOf: string; readonly eligibleOpen: string; readonly reason: 'STRATEGIC_EXIT';
}
export interface ExecutionAudit {
  readonly id: string; readonly asOf: string; readonly kind: string; readonly reason: string;
  readonly reservationId: string | null; readonly positionId: string | null; readonly exitRequestId: string | null;
  readonly before: BudgetSnapshot; readonly after: BudgetSnapshot; readonly fillId: string | null;
}
export type ExecutionCommand =
  | { readonly id: string; readonly kind: 'AUTHORIZE'; readonly authorization: AuthorizationResult }
  | { readonly id: string; readonly kind: 'OPEN'; readonly asOf: string; readonly openings: readonly OpeningEvent[]; readonly exits: readonly ExitRequest[] }
  | { readonly id: string; readonly kind: 'CLOSE'; readonly asOf: string; readonly candles: readonly Candle[] };
/** In-memory evidence only; no persisted ledger or cross-process transaction. */
export interface ExecutionState {
  readonly initial: BudgetSnapshot; readonly asOf: string; readonly phase: 'BEFORE_OPEN' | 'AFTER_OPEN';
  readonly portfolio: BudgetSnapshot; readonly availableCash: string; readonly dailyBase: string;
  readonly marks: Readonly<Record<Asset, string | null>>;
  readonly openingPrices: Readonly<Record<Asset, string | null>>;
  readonly reservations: readonly ExecutionReservation[]; readonly positions: readonly ExecutedPosition[];
  readonly orders: readonly ExecutionOrder[];
  readonly origins: readonly AuthorizationState[]; readonly fills: readonly ExecutionFill[];
  readonly events: readonly ExecutionAudit[]; readonly commands: readonly ExecutionCommand[];
  readonly realizedPnl: string; readonly unrealizedPnl: string; readonly feesPaid: string;
}

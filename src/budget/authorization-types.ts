import { BudgetQuote, BudgetSnapshot } from './types';

export interface CapitalReservation {
  readonly id: string;
  readonly authorizationId: string;
  readonly decisionId: string;
  readonly quoteId: string;
  readonly asset: 'BTC' | 'ETH';
  readonly strategyId: string;
  readonly strategyVersion: string;
  readonly quantity: string;
  readonly capital: string;
  readonly plannedRisk: string;
  readonly authorizedAt: string;
  readonly eligibleOpen: string;
  readonly phase: 'BEFORE_OPEN';
  readonly validity: 'NEXT_ELIGIBLE_OPEN_ONLY';
  readonly status: 'ACTIVE' | 'SETTLED' | 'RELEASED';
  readonly execution: 'NOT_EXECUTED';
}
export interface AuthorizationDecision {
  readonly sequence: number;
  readonly id: string;
  readonly decisionId: string;
  /** Canonical decision, closed price and original rank; no mutable balances. */
  readonly request: string;
  readonly quoteId: string;
  readonly quote: BudgetQuote;
  readonly status: 'AUTHORIZED' | 'REJECTED';
  readonly reservationId: string | null;
  readonly before: BudgetSnapshot;
  readonly after: BudgetSnapshot;
}
export interface ReservationTransition {
  readonly sequence: number;
  readonly asOf: string;
  readonly reservationId: string;
  readonly from: 'ACTIVE';
  readonly to: 'RELEASED';
  readonly reason: 'CANCELLED' | 'EXPIRED';
  readonly before: BudgetSnapshot;
  readonly after: BudgetSnapshot;
}
/** Explicit local state only. It is not a durable ledger or a cross-process lock. */
export interface AuthorizationState {
  readonly asOf: string;
  readonly phase: 'BEFORE_OPEN' | 'AFTER_OPEN';
  readonly reference: BudgetSnapshot;
  readonly snapshot: BudgetSnapshot;
  readonly decisions: readonly AuthorizationDecision[];
  readonly reservations: readonly CapitalReservation[];
  readonly transitions: readonly ReservationTransition[];
}
export interface AuthorizationResult {
  readonly state: AuthorizationState;
  readonly decisions: readonly AuthorizationDecision[];
  readonly replayed: readonly string[];
  readonly execution: 'NOT_EXECUTED';
}

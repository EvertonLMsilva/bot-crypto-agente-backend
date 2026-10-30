import { Asset } from '../simulation/candle';
import { SignalAssessment, SignalSelection } from '../signals/types';

/** Explicit observation supplied by the caller; no portfolio lookup or fallback. */
export interface PositionView {
  readonly asset: Asset;
  readonly asOf: string;
  readonly status: 'FLAT' | 'OPEN' | 'UNKNOWN';
}
export type DecisionType = 'ENTRY_CANDIDATE' | 'WAIT';
export type DecisionReason = 'QUALIFIED_REPRESENTATIVE' | 'NO_QUALIFIED_REPRESENTATIVE' | 'POSITION_OPEN' | 'POSITION_UNKNOWN';
export type ExitEvaluation = 'EXIT_EVALUATION_PENDING' | 'NOT_EVALUATED' | 'NOT_APPLICABLE';

/** Evidence in memory, not a persistent ledger or a financial authorization. */
export interface DecisionAudit {
  readonly decisionId: string;
  readonly asset: Asset;
  readonly asOf: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly type: DecisionType;
  readonly position: PositionView;
  readonly reasons: readonly DecisionReason[];
  readonly exitEvaluation: ExitEvaluation;
  readonly selection: SignalSelection;
}
export interface DecisionEnvelope {
  readonly id: string;
  readonly asset: Asset;
  readonly asOf: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly type: DecisionType;
  readonly position: PositionView;
  readonly reasons: readonly DecisionReason[];
  readonly exitEvaluation: ExitEvaluation;
  readonly candidate: SignalAssessment | null;
  readonly validity: 'NEXT_ELIGIBLE_OPEN_ONLY' | 'CURRENT_CYCLE_ONLY';
  readonly financialAuthorization: 'NOT_EVALUATED';
  readonly execution: 'NOT_EXECUTED';
  readonly audit: DecisionAudit;
}

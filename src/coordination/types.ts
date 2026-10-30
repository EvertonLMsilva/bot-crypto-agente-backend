import { DecisionEnvelope } from '../operations/types';
import { Asset } from '../simulation/candle';

export interface CoordinatorState { readonly nextTieAsset: Asset }
export type PriorityCriterion = 'SCORE_ROUNDED' | 'SIGNAL_TIME' | 'ROUND_ROBIN' | 'CANONICAL_ID';
export interface RankingRecord {
  readonly rank: number;
  readonly decisionId: string;
  readonly asset: Asset;
  readonly asOf: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly strategyId: string;
  readonly strategyVersion: string;
  readonly scoreRounded: number;
  readonly criterion: PriorityCriterion | 'ONLY_OPPORTUNITY';
  readonly comparedWith: string | null;
}
export interface TieRecord {
  readonly scoreRounded: number;
  readonly signalAsOf: string;
  readonly decisionIds: readonly string[];
  readonly preferredAsset: Asset;
  readonly nextTieAsset: Asset;
}
export interface CoordinationResult {
  readonly asOf: string;
  readonly opportunities: readonly DecisionEnvelope[];
  readonly waits: readonly DecisionEnvelope[];
  readonly nextState: CoordinatorState;
  readonly financialAuthorization: 'NOT_EVALUATED';
  readonly execution: 'NOT_EXECUTED';
  readonly audit: {
    readonly previousState: CoordinatorState;
    readonly nextState: CoordinatorState;
    readonly ranking: readonly RankingRecord[];
    readonly ties: readonly TieRecord[];
    readonly duplicates: readonly { readonly decisionId: string; readonly ignoredCount: number }[];
  };
}

import { AuthorizationResult, validateAuthorizationState } from '../budget';
import { BudgetSnapshot } from '../budget/types';
import { ExecutionState } from './execution-types';
import { immutable, requireBudget, same, audit, identity } from './execution-accounting';

/** Projection only; the historical D3.2 evidence is never rebased or mutated.
 * The D4 command registry and all prior decisions survive across budget epochs.
 */
export function budgetProjection(s: ExecutionState): BudgetSnapshot { return immutable(s.portfolio); }
export function adoptAuthorizations(s: ExecutionState, result: AuthorizationResult): ExecutionState {
  requireBudget(s.phase === 'BEFORE_OPEN' && result && result.execution === 'NOT_EXECUTED', 'Authorization must precede opening');
  const proof = validateAuthorizationState(result.state);
  requireBudget(proof.asOf === s.asOf && proof.phase === 'BEFORE_OPEN' && same(proof.reference, s.portfolio)
    && proof.transitions.length === 0 && same(result.decisions, proof.decisions) && result.replayed.length === 0, 'D3.2 evidence must match current D4 portfolio');
  const previousIds = new Set(s.origins.flatMap(o => o.decisions.map(d => d.decisionId)));
  requireBudget(proof.decisions.every(d => !previousIds.has(d.decisionId)) && proof.reservations.every(r => r.status === 'ACTIVE'),
    'Previously processed opportunity or terminal imported reservation');
  return audit(s, { ...s, availableCash: proof.snapshot.availableCash, origins: [...s.origins, proof],
    reservations: [...s.reservations, ...proof.reservations.map(source => ({ source, status: 'ACTIVE' as const, terminalId: null }))] },
    'AUTHORIZATION', 'D3_2_VALIDATED', identity('AUTHORIZATION', s.asOf));
}

import { ExecutedPosition, ExitRequest } from './execution-types';
import { budgetCycleTime, requireBudget, identity, immutable, same } from './execution-accounting';

/** Execution consumes an explicit specialist request; this does not generate or
 * assert a technical trigger, and D1 EXIT_EVALUATION_PENDING is not an order.
 */
export function createExitRequest(position: ExecutedPosition, signalAsOf: string): ExitRequest {
  const time = budgetCycleTime(signalAsOf);
  requireBudget(position && position.status === 'OPEN' && time > position.openedAt, 'Exit requires an open position and a later closed signal frontier');
  return immutable({ id: identity('EXIT_REQUEST', position.id, time), positionId: position.id, asset: position.asset,
    strategyId: position.strategyId, strategyVersion: position.strategyVersion, signalAsOf: time, eligibleOpen: time, reason: 'STRATEGIC_EXIT' });
}
export function validateExitRequest(request: ExitRequest, position: ExecutedPosition, asOf: string): void {
  requireBudget(request && budgetCycleTime(request.signalAsOf) <= asOf && same(createExitRequest(position, request.signalAsOf), request),
    'Exit origin, identity or validity mismatch');
}

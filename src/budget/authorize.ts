import { CoordinationResult } from '../coordination/types';
import { Asset } from '../simulation/candle';
import { AuthorizationDecision, AuthorizationResult, AuthorizationState, CapitalReservation } from './authorization-types';
import { BudgetSnapshot, ClosedPriceReference } from './types';
import { budgetCycleTime, requireBudget, validateBudgetSnapshot } from './limits';
import { evaluateBudgetQuote } from './quote';
import { authorizationId, immutable, moveReservation, quoteId, reservationId, same, validateAuthorizationState } from './reservations';

/** All-or-nothing pure call: evaluates in the supplied D2 order, using each
 * previous logical hold. There is no durable transaction, order, fee or fill.
 */
export function authorizeEntryBatch(batch: CoordinationResult, snapshot: BudgetSnapshot,
  prices: Readonly<Record<Asset, ClosedPriceReference>>, input: AuthorizationState, asOf: string): AuthorizationResult {
  const state = validateAuthorizationState(input), time = budgetCycleTime(asOf);
  validateBudgetSnapshot(snapshot);
  requireBudget(time >= state.asOf && budgetCycleTime(snapshot.asOf) === time && budgetCycleTime(batch.asOf) === time
    && same(snapshot, { ...state.snapshot, asOf: snapshot.asOf }), 'Snapshot/frontier must match the explicit state');
  requireBudget(batch && Array.isArray(batch.opportunities) && Array.isArray(batch.waits) && batch.audit
    && Array.isArray(batch.audit.ranking) && batch.audit.ranking.length === batch.opportunities.length
    && batch.financialAuthorization === 'NOT_EVALUATED' && batch.execution === 'NOT_EXECUTED', 'Validated D2 batch required');
  requireBudget(new Set(batch.opportunities.map(d => d.id)).size === batch.opportunities.length
    && new Set(batch.opportunities.map(d => JSON.stringify([d.asset, d.asOf]))).size === batch.opportunities.length, 'Duplicate opportunity in D2 batch');
  let current = immutable({ ...snapshot, asOf: time });
  const decisions = [...state.decisions], reservations = [...state.reservations];
  const processed: AuthorizationDecision[] = [], replayed: string[] = [];
  for (const [i, d] of batch.opportunities.entries()) {
    const price = prices?.[d.asset as Asset];
    requireBudget(price, 'Explicit closed price required');
    const request = JSON.stringify(immutable([d, price, i + 1, batch.audit.ranking[i]]));
    const previous = decisions.find(v => v.decisionId === d.id);
    if (previous) {
      requireBudget(previous.request === request, 'Divergent request for the same decision identity');
      processed.push(previous); replayed.push(d.id); continue;
    }
    requireBudget(!decisions.some(v => v.quote.asset === d.asset && v.quote.signalAsOf === d.asOf), 'Conflicting official identity for asset/cycle');
    requireBudget(time > state.asOf || state.phase === 'BEFORE_OPEN', 'Opening already processed: no new authorization');
    const quote = evaluateBudgetQuote(batch, i + 1, current, price), qid = quoteId(d.id, time);
    const approved = quote.status === 'QUOTABLE';
    let after = current;
    if (approved) {
      const e = quote.estimates!;
      const reservation: CapitalReservation = { id: reservationId(d.id), authorizationId: authorizationId(d.id), decisionId: d.id,
        quoteId: qid, asset: d.asset, strategyId: quote.strategyId, strategyVersion: quote.strategyVersion,
        quantity: e.quantity, capital: e.totalCommitment, plannedRisk: e.plannedRisk, authorizedAt: time,
        eligibleOpen: quote.signalAsOf, phase: 'BEFORE_OPEN', validity: 'NEXT_ELIGIBLE_OPEN_ONLY', status: 'ACTIVE', execution: 'NOT_EXECUTED' };
      after = moveReservation(current, reservation, 1, time); reservations.push(immutable(reservation));
    }
    const record = immutable<AuthorizationDecision>({ sequence: decisions.length + state.transitions.length + 1,
      id: authorizationId(d.id), decisionId: d.id, request, quoteId: qid, quote,
      status: approved ? 'AUTHORIZED' : 'REJECTED', reservationId: approved ? reservationId(d.id) : null, before: current, after });
    decisions.push(record); processed.push(record); current = after;
  }
  const next = validateAuthorizationState({ ...state, asOf: time, phase: time > state.asOf ? 'BEFORE_OPEN' : state.phase,
    snapshot: current, decisions, reservations });
  return immutable({ state: next, decisions: processed, replayed, execution: 'NOT_EXECUTED' });
}

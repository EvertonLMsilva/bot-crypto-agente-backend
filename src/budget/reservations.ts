import { AuthorizationDecision, AuthorizationState, CapitalReservation, ReservationTransition } from './authorization-types';
import { BudgetEstimates, BudgetSnapshot, ClosedPriceReference } from './types';
import { CoordinationResult, RankingRecord } from '../coordination/types';
import { DecisionEnvelope } from '../operations/types';
import { budgetCycleTime, requireBudget, validateBudgetSnapshot } from './limits';
import { formatFixed8, parseFixed8 } from './fixed8';
import { evaluateBudgetQuote } from './quote';

/** Canonical, deeply frozen JSON copy; never freezes caller-owned objects. */
export function immutable<T>(value: T, ancestors = new Set<object>()): T {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  requireBudget(typeof value === 'object' && !ancestors.has(value), 'Non-JSON authorization state');
  requireBudget(Array.isArray(value) || Object.prototype.toString.call(value) === '[object Object]', 'Plain JSON state required');
  ancestors.add(value);
  const result = Array.isArray(value) ? value.map(v => immutable(v, ancestors))
    : Object.fromEntries(Object.keys(value).sort().map(k => [k, immutable((value as Record<string, unknown>)[k], ancestors)]));
  ancestors.delete(value);
  return Object.freeze(result) as T;
}
export const same = (a: unknown, b: unknown): boolean => JSON.stringify(immutable(a)) === JSON.stringify(immutable(b));
export const authorizationId = (decisionId: string): string => JSON.stringify(['AUTHORIZATION', decisionId]);
export const reservationId = (decisionId: string): string => JSON.stringify(['RESERVATION', decisionId]);
export const quoteId = (decisionId: string, asOf: string): string => JSON.stringify(['D3.1', decisionId, asOf]);

/** Validate historical evidence without replacing it or changing the live batch.
 * The singleton is only a view for D3.1's existing quote evaluator: its local
 * index is1, while the original D2 rank is checked and retained in the comparison.
 * No coordinator, priority calculation or score calculation is invoked.
 */
function validateStoredQuote(d: AuthorizationDecision, request: readonly unknown[]): void {
  const e = d.quote.estimates;
  if (e !== null) {
    requireBudget(e && typeof e === 'object', 'Explicit stored financial estimates required');
    const keys: readonly (keyof BudgetEstimates)[] = ['quantity', 'exposureReference', 'conservativeBuyPrice',
      'grossCommitment', 'buyFee', 'totalCommitment', 'stopPrice', 'stopNetReceipt', 'plannedRisk'];
    for (const key of keys) parseFixed8(e[key]);
    const total = parseFixed8(e.totalCommitment), net = parseFixed8(e.stopNetReceipt);
    requireBudget(parseFixed8(e.grossCommitment) + parseFixed8(e.buyFee) === total
      && total - net === parseFixed8(e.plannedRisk), 'Contradictory stored commitment/receipt/risk');
  }
  const decision = request[0] as DecisionEnvelope, ranking = request[3] as RankingRecord;
  requireBudget(ranking && Number.isInteger(d.quote.rank) && d.quote.rank >= 1 && ranking.rank === d.quote.rank,
    'Invalid stored quote ranking reference');
  const tieState = { nextTieAsset: 'BTC' as const };
  const isolated: CoordinationResult = { asOf: d.quote.asOf, opportunities: [decision], waits: [], nextState: tieState,
    financialAuthorization: 'NOT_EVALUATED', execution: 'NOT_EXECUTED', audit: { previousState: tieState, nextState: tieState,
      ranking: [{ ...ranking, rank: 1 }], ties: [], duplicates: [] } };
  const expected = evaluateBudgetQuote(isolated, 1, d.before, request[1] as ClosedPriceReference);
  requireBudget(same({ ...expected, rank: d.quote.rank }, d.quote), 'Stored quote differs from its original financial inputs');
}

/** Pure accounting of a logical hold. Equity and positions are untouched. */
export function moveReservation(p: BudgetSnapshot, r: CapitalReservation, direction: 1 | -1, asOf: string): BudgetSnapshot {
  const cost = parseFixed8(r.capital), risk = parseFixed8(r.plannedRisk), sign = BigInt(direction);
  return immutable({ ...p, asOf, availableCash: formatFixed8(parseFixed8(p.availableCash) - sign * cost),
    reservedCash: formatFixed8(parseFixed8(p.reservedCash) + sign * cost),
    committedExposure: { ...p.committedExposure, [r.asset]: formatFixed8(parseFixed8(p.committedExposure[r.asset]) + sign * cost) },
    committedRisk: formatFixed8(parseFixed8(p.committedRisk) + sign * risk),
    reservations: { ...p.reservations, [r.asset]: direction === 1 ? 'ACTIVE' : 'NONE' } });
}

export function createAuthorizationState(snapshot: BudgetSnapshot): AuthorizationState {
  validateBudgetSnapshot(snapshot);
  const reference = immutable({ ...snapshot, asOf: budgetCycleTime(snapshot.asOf) });
  return immutable({ asOf: reference.asOf, phase: 'BEFORE_OPEN', reference, snapshot: reference, decisions: [], reservations: [], transitions: [] });
}

/** Exact reconciliation against the explicitly supplied baseline and local holds.
 * External positions/reservations remain part of the baseline, never released here.
 */
export function validateAuthorizationState(input: AuthorizationState): AuthorizationState {
  const s = immutable(input);
  requireBudget(s && Array.isArray(s.decisions) && Array.isArray(s.reservations) && Array.isArray(s.transitions), 'Explicit authorization state required');
  const time = budgetCycleTime(s.asOf);
  validateBudgetSnapshot(s.reference); validateBudgetSnapshot(s.snapshot);
  requireBudget(s.asOf === time && s.reference.asOf <= time && s.snapshot.asOf === time
    && ['BEFORE_OPEN', 'AFTER_OPEN'].includes(s.phase), 'Inconsistent state frontier');
  const ids = new Set<string>(), decisionIds = new Set<string>();
  for (const d of s.decisions) {
    requireBudget(!decisionIds.has(d.decisionId) && d.id === authorizationId(d.decisionId)
      && d.quoteId === quoteId(d.decisionId, d.quote.asOf) && d.quote.decisionId === d.decisionId
      && d.quote.asOf >= s.reference.asOf && d.quote.asOf <= time, 'Invalid authorization identity/frontier');
    decisionIds.add(d.decisionId);
    let request;
    try { request = JSON.parse(d.request) as unknown[]; } catch { throw new RangeError('Invalid request evidence'); }
    requireBudget(Array.isArray(request) && request.length === 4 && JSON.stringify(immutable(request)) === d.request
      && same(request[1], d.quote.price) && request[2] === d.quote.rank
      && request[0] && typeof request[0] === 'object' && (request[0] as {id: string}).id === d.decisionId, 'Invalid request evidence');
    requireBudget(d.quote.financialAuthorization === 'NOT_EVALUATED' && d.quote.execution === 'NOT_EXECUTED'
      && d.quote.reservation === 'NOT_CREATED' && d.before.asOf === d.quote.asOf && d.after.asOf === d.quote.asOf, 'Invalid quote audit');
    validateBudgetSnapshot(d.before); validateBudgetSnapshot(d.after);
    validateStoredQuote(d, request);
    requireBudget(d.status === 'AUTHORIZED' || d.status === 'REJECTED', 'Invalid authorization status');
    if (d.status === 'REJECTED') {
      requireBudget(d.reservationId === null && d.quote.status === 'NOT_QUOTABLE' && same(d.before, d.after), 'Invalid rejected audit');
      continue;
    }
    const r = s.reservations.find(v => v.id === d.reservationId), e = d.quote.estimates;
    requireBudget(r && e && d.quote.status === 'QUOTABLE' && d.quote.limits.eligible && d.quote.reasons.length === 0
      && r.id === reservationId(d.decisionId) && r.authorizationId === d.id && r.decisionId === d.decisionId
      && r.quoteId === d.quoteId && r.asset === d.quote.asset && r.strategyId === d.quote.strategyId
      && r.strategyVersion === d.quote.strategyVersion && r.capital === e.totalCommitment
      && r.quantity === e.quantity && r.plannedRisk === e.plannedRisk && parseFixed8(r.quantity) > 0n
      && r.authorizedAt === d.quote.asOf && r.eligibleOpen === d.quote.signalAsOf && r.authorizedAt === r.eligibleOpen
      && r.phase === 'BEFORE_OPEN' && r.validity === 'NEXT_ELIGIBLE_OPEN_ONLY' && r.execution === 'NOT_EXECUTED'
      && (r.status === 'ACTIVE' || r.status === 'RELEASED') && !ids.has(r.id), 'Invalid frozen reservation');
    requireBudget(d.before.reservations[r.asset] === 'NONE' && same(moveReservation(d.before, r, 1, d.quote.asOf), d.after), 'Invalid reservation debit');
    ids.add(r.id);
  }
  requireBudget(ids.size === s.reservations.length, 'Orphan or duplicate reservation');
  const released = new Set<string>();
  let previousTime = s.reference.asOf;
  for (const t of s.transitions) {
    const r = s.reservations.find(v => v.id === t.reservationId);
    requireBudget(r && r.status === 'RELEASED' && !released.has(r.id)
      && t.from === 'ACTIVE' && t.to === 'RELEASED' && ['CANCELLED', 'EXPIRED'].includes(t.reason)
      && budgetCycleTime(t.asOf) === t.asOf && t.asOf >= previousTime && t.asOf >= r.authorizedAt && t.asOf <= time
      && t.before.reservations[r.asset] === 'ACTIVE' && same(moveReservation(t.before, r, -1, t.asOf), t.after), 'Invalid release transition');
    released.add(r.id); previousTime = t.asOf;
  }
  let expected = { ...s.reference, asOf: time };
  for (const r of s.reservations) {
    requireBudget((r.status === 'RELEASED') === released.has(r.id), 'Missing release audit');
    if (r.status === 'ACTIVE') {
      requireBudget(expected.reservations[(r as CapitalReservation).asset] === 'NONE', 'Conflicting active reservations');
      expected = moveReservation(expected, r, 1, time);
    }
  }
  requireBudget(same(expected, s.snapshot), 'Inconsistent financial state: exact reconciliation failed');
  requireBudget(!s.transitions.some(t => t.reason === 'EXPIRED' && t.asOf === time) || s.phase === 'AFTER_OPEN', 'Lost opening cannot return to BEFORE_OPEN');
  // Reconcile each historical before/after as well as the current aggregates.
  const events = [...s.decisions.map(d => ({ sequence: d.sequence, asOf: d.quote.asOf, before: d.before, after: d.after })), ...s.transitions]
    .sort((a, b) => a.sequence - b.sequence);
  let cursor = s.reference;
  for (const [i, event] of events.entries()) {
    requireBudget(event.sequence === i + 1 && event.asOf >= cursor.asOf
      && same({ ...cursor, asOf: event.asOf }, event.before), 'Broken chronological audit chain');
    cursor = event.after;
  }
  requireBudget(same({ ...cursor, asOf: time }, s.snapshot), 'Audit does not reconcile current state');
  return s;
}

export function releaseReservation(input: AuthorizationState, id: string, asOf: string,
  reason: 'CANCELLED' | 'EXPIRED' = 'CANCELLED'): AuthorizationState {
  const s = validateAuthorizationState(input), time = budgetCycleTime(asOf);
  requireBudget(time >= s.asOf && (reason === 'CANCELLED' || reason === 'EXPIRED'), 'Out-of-order or invalid release');
  const r = s.reservations.find(v => v.id === id);
  requireBudget(r, 'Unknown reservation');
  requireBudget(reason !== 'EXPIRED' || time >= r.eligibleOpen, 'Opening not yet lost');
  if (r.status === 'RELEASED') return s;
  const before = immutable({ ...s.snapshot, asOf: time }), after = moveReservation(before, r, -1, time);
  const transition: ReservationTransition = { sequence: s.decisions.length + s.transitions.length + 1, asOf: time, reservationId: id,
    from: 'ACTIVE', to: 'RELEASED', reason, before, after };
  return validateAuthorizationState({ ...s, asOf: time, phase: reason === 'EXPIRED' ? 'AFTER_OPEN' : time > s.asOf ? 'BEFORE_OPEN' : s.phase, snapshot: after,
    reservations: s.reservations.map(v => v.id === id ? { ...v, status: 'RELEASED' } : v), transitions: [...s.transitions, transition] });
}

/** Explicit AFTER_OPEN stage is required; timestamps alone cannot distinguish
 * authorization before an opening from expiration after that same opening.
 */
export function expireReservations(input: AuthorizationState, asOf: string, phase: 'AFTER_OPEN'): AuthorizationState {
  let s = validateAuthorizationState(input);
  const time = budgetCycleTime(asOf);
  requireBudget(phase === 'AFTER_OPEN' && time >= s.asOf, 'Explicit chronological AFTER_OPEN phase required');
  for (const r of s.reservations) if (r.status === 'ACTIVE' && r.eligibleOpen <= time) s = releaseReservation(s, r.id, time, 'EXPIRED');
  return immutable({ ...s, asOf: time, phase: 'AFTER_OPEN', snapshot: { ...s.snapshot, asOf: time } });
}

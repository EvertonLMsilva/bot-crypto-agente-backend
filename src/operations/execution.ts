import { AuthorizationResult } from '../budget';
import { parseFixed8, formatFixed8, divideDown } from '../budget/fixed8';
import { evaluateBudgetLimits } from '../budget/limits';
import { BudgetSnapshot } from '../budget/types';
import { Asset, Candle } from '../simulation/candle';
import { FIVE_MINUTES_MS } from '../simulation/clock';
import { adoptAuthorizations, budgetProjection } from './budget-bridge';
import { ExecutionCommand, ExecutionState, ExitRequest, OpeningEvent, ExecutionFill, ExecutedPosition } from './execution-types';
import { assets, immutable, same, requireBudget, budgetCycleTime, identity, initialExecutionState, refresh, audit, executionAmounts, exact } from './execution-accounting';
import { openingProtection, closedProtection, sellPosition } from './execution-protection';
import { validateExitRequest } from './exit-request';

function release(s: ExecutionState, id: string, reason: string): ExecutionState {
  const r = s.reservations.find(v => v.source.id === id)!;
  const terminalId = identity('RELEASE', id);
  return audit(s, { ...s, availableCash: formatFixed8(parseFixed8(s.availableCash) + parseFixed8(r.source.capital)),
    reservations: s.reservations.map(v => v.source.id === id ? { ...v, status: 'RELEASED', terminalId } : v) },
    'RELEASE', reason, terminalId, id);
}

function buy(s: ExecutionState, id: string, opening: string, exited: ReadonlySet<Asset>): ExecutionState {
  const r = s.reservations.find(v => v.source.id === id)!.source;
  const reference = exact(parseFixed8(opening)), amounts = executionAmounts('BUY', r.quantity, reference);
  // Remove this hold for evaluation, retaining all other positions and holds.
  const unheld = refresh({ ...s, availableCash: formatFixed8(parseFixed8(s.availableCash) + parseFixed8(r.capital)),
    reservations: s.reservations.map(v => v.source.id === id ? { ...v, status: 'RELEASED' } : v) });
  const cost = parseFixed8(amounts.total), entry = parseFixed8(amounts.price);
  const stop = exact(entry * 98n, 100n), take = exact(entry * 104n, 100n);
  const stopReceipt = executionAmounts('SELL', r.quantity, stop).total;
  const risk = cost - parseFixed8(stopReceipt);
  requireBudget(risk >= 0n, 'Negative entry risk');
  const limits = evaluateBudgetLimits(unheld.portfolio, r.asset, amounts.total, formatFixed8(risk));
  const reason = exited.has(r.asset) ? 'SAME_FRONTIER_EXIT' : cost > parseFixed8(r.capital) ? 'RESERVE_EXCEEDED'
    : risk > parseFixed8(r.plannedRisk) ? 'AUTHORIZED_RISK_EXCEEDED' : !limits.eligible ? limits.reasons.join('|') : null;
  if (reason !== null) return release(s, id, reason);
  const positionId = identity('POSITION', r.id), terminalId = identity('SETTLEMENT', r.id);
  const fill: ExecutionFill = { id: identity('FILL', r.id, 'BUY'), positionId, reservationId: r.id, asset: r.asset,
    asOf: s.asOf, side: 'BUY', reason: 'AUTHORIZED_ENTRY', quantity: r.quantity, reference, ...amounts, slippage: '0.0005', feeRate: '0.001' };
  const p: ExecutedPosition = { id: positionId, decisionId: r.decisionId, reservationId: r.id, asset: r.asset,
    strategyId: r.strategyId, strategyVersion: r.strategyVersion, quantity: r.quantity, entryPrice: amounts.price,
    entryCost: amounts.total, plannedRisk: formatFixed8(risk), openedAt: s.asOf, closedAt: null, status: 'OPEN', stop, take, realizedPnl: '0.00000000' };
  const candidate = refresh({ ...s, availableCash: formatFixed8(parseFixed8(unheld.availableCash) - cost),
    reservations: s.reservations.map(v => v.source.id === r.id ? { ...v, status: 'SETTLED', terminalId } : v),
    positions: [...s.positions, p], fills: [...s.fills, fill] });
  // Costs already known at this opening must not leave the resulting portfolio
  // above a maximum just because the pre-fill equity was one tick greater.
  const post = evaluateBudgetLimits({ ...candidate.portfolio, positions: { ...candidate.portfolio.positions, [r.asset]: 'FLAT' },
    reservations: { ...candidate.portfolio.reservations, [r.asset]: 'NONE' } }, r.asset, '0.00000000', '0.00000000');
  if (!post.eligible || risk > parseFixed8(post.limits.operationRisk)) return release(s, id, 'POST_FILL_LIMIT');
  return audit(s, candidate, 'ENTRY_FILL', 'ACTIVE_TO_SETTLED', terminalId, r.id, positionId, fill);
}

function opening(s: ExecutionState, command: Extract<ExecutionCommand, {kind: 'OPEN'}>): ExecutionState {
  const time = budgetCycleTime(command.asOf), values = command.openings;
  requireBudget(s.phase === 'BEFORE_OPEN' && time >= s.asOf && (time === s.asOf || !s.positions.some(p => p.status === 'OPEN')),
    'Opening out of order or missing market interval for existing position');
  requireBudget(values.length === 2 && new Set(values.map(v => v.asset)).size === 2, 'Explicit BTC/ETH opening batch required');
  const marks = { ...s.marks };
  for (const v of values) {
    requireBudget(v && Object.keys(v).length === 3 && assets.includes(v.asset) && budgetCycleTime(v.asOf) === time
      && parseFixed8(v.price) > 0n, 'Invalid or future opening event');
    marks[v.asset] = v.price;
  }
  let next = audit(s, { ...s, asOf: time, marks, openingPrices: marks }, 'OPENING', 'KNOWN_OPEN_PRICES', command.id);
  if (time.slice(0, 10) !== s.asOf.slice(0, 10)) next = refresh({ ...next, dailyBase: next.portfolio.equity });
  const requests = new Map<string, ExitRequest>();
  for (const request of command.exits) {
    const p = s.positions.find(v => v.id === request.positionId && v.status === 'OPEN');
    requireBudget(p, 'Exit must refer to an existing open position');
    validateExitRequest(request, p, time);
    requireBudget(!requests.has(request.id) || same(requests.get(request.id), request), 'Divergent exit identity');
    requests.set(request.id, request);
  }
  const exited = new Set<Asset>(s.positions.filter(p => p.status === 'CLOSED' && p.closedAt === time).map(p => p.asset));
  for (const p of next.positions.filter(v => v.status === 'OPEN')) {
    const protection = openingProtection(p, marks[p.asset]!);
    if (protection) { next = sellPosition(next, p, protection.reference, protection.reason); exited.add(p.asset); }
  }
  for (const request of [...requests.values()].sort((a, b) => a.id < b.id ? -1 : 1)) {
    const p = next.positions.find(v => v.id === request.positionId)!;
    if (p.status === 'CLOSED' || request.eligibleOpen !== time) {
      next = audit(next, next, 'EXIT_REQUEST', p.status === 'CLOSED' ? 'SUPERSEDED_BY_PROTECTION' : 'REVALIDATION_REQUIRED',
        request.id, p.reservationId, p.id, null, request.id);
    } else {
      next = sellPosition(next, p, exact(parseFixed8(marks[p.asset]!)), 'STRATEGIC_EXIT', request.id); exited.add(p.asset);
    }
  }
  for (const r of next.reservations.filter(v => v.status === 'ACTIVE')) {
    requireBudget(r.source.eligibleOpen <= time, 'Future authorization cannot execute');
    next = r.source.eligibleOpen < time ? release(next, r.source.id, 'EXPIRED') : buy(next, r.source.id, marks[r.source.asset]!, exited);
  }
  return refresh({ ...next, phase: 'AFTER_OPEN' });
}

function closed(s: ExecutionState, command: Extract<ExecutionCommand, {kind: 'CLOSE'}>): ExecutionState {
  const time = budgetCycleTime(command.asOf);
  requireBudget(s.phase === 'AFTER_OPEN' && Date.parse(time) - Date.parse(s.asOf) === FIVE_MINUTES_MS
    && command.candles.length === 2 && new Set(command.candles.map(c => c.asset)).size === 2, 'Closed batch out of order');
  const marks = { ...s.marks };
  for (const c of command.candles) {
    requireBudget(c && assets.includes(c.asset) && budgetCycleTime(c.openTime) === s.asOf && budgetCycleTime(c.closeTime) === time
      && c.open === s.openingPrices[c.asset], 'Candle interval/opening mismatch or future candle');
    const o = parseFixed8(c.open), h = parseFixed8(c.high), l = parseFixed8(c.low), p = parseFixed8(c.close);
    parseFixed8(c.volume);
    requireBudget(l > 0n && l <= o && l <= p && h >= o && h >= p && h >= l, 'Invalid closed OHLCV');
    marks[c.asset] = c.close;
  }
  let next = audit(s, { ...s, asOf: time, marks }, 'CLOSED_CANDLE', 'KNOWN_CLOSED_MARKS', command.id);
  for (const p of next.positions.filter(v => v.status === 'OPEN')) {
    const c = command.candles.find(v => v.asset === p.asset)!, hit = closedProtection(p, c);
    if (hit) next = sellPosition(next, p, hit.reference, hit.reason);
  }
  if (time.slice(0, 10) !== s.asOf.slice(0, 10)) next = refresh({ ...next, dailyBase: next.portfolio.equity });
  return refresh({ ...next, phase: 'BEFORE_OPEN', openingPrices: { BTC: null, ETH: null } });
}

function apply(s: ExecutionState, command: ExecutionCommand): ExecutionState {
  requireBudget(!s.commands.some(c => c.id === command.id), 'Duplicate execution command');
  let next: ExecutionState;
  if (command.kind === 'CANCEL') {
    requireBudget(command.id === identity('CANCEL', command.reservationId) && budgetCycleTime(command.asOf) === s.asOf
      && s.phase === 'BEFORE_OPEN' && typeof command.reason === 'string' && /^[A-Z][A-Z_]*$/.test(command.reason), 'Invalid cancellation identity/frontier/reason');
    requireBudget(s.reservations.some(r => r.source.id === command.reservationId && r.status === 'ACTIVE'), 'Only the identified ACTIVE reservation may be cancelled');
    next = release(s, command.reservationId, command.reason);
  } else if (command.kind === 'AUTHORIZE') {
    requireBudget(command.id === identity('AUTHORIZE', command.authorization.state.asOf), 'Invalid authorization command identity');
    next = adoptAuthorizations(s, command.authorization);
  } else if (command.kind === 'OPEN') {
    requireBudget(command.id === identity('OPEN', budgetCycleTime(command.asOf)), 'Invalid opening command identity');
    next = opening(s, command);
  } else {
    requireBudget(command.kind === 'CLOSE' && command.id === identity('CLOSE', budgetCycleTime(command.asOf)), 'Invalid closing command identity');
    next = closed(s, command);
  }
  return immutable({ ...next, commands: [...s.commands, command] });
}
export function createExecutionState(initial: BudgetSnapshot): ExecutionState { return initialExecutionState(initial); }
export function validateExecutionState(input: ExecutionState): ExecutionState {
  const s = immutable(input);
  requireBudget(s && Array.isArray(s.commands), 'Explicit D4 execution state required');
  let expected = initialExecutionState(s.initial);
  for (const command of s.commands) expected = apply(expected, command);
  requireBudget(same(expected, s), 'Corrupted D4 financial state or audit evidence');
  return s;
}
function dispatch(input: ExecutionState, command: ExecutionCommand): ExecutionState {
  const s = validateExecutionState(input), payload = immutable(command), existing = s.commands.find(v => v.id === payload.id);
  if (existing) { requireBudget(same(existing, payload), 'Divergent payload for execution identity'); return s; }
  return apply(s, payload);
}
export function acceptAuthorizations(s: ExecutionState, authorization: AuthorizationResult): ExecutionState {
  return dispatch(s, { id: identity('AUTHORIZE', authorization.state.asOf), kind: 'AUTHORIZE', authorization });
}
export function processOpening(s: ExecutionState, openings: readonly OpeningEvent[], exits: readonly ExitRequest[], asOf: string): ExecutionState {
  // Asset order is transport detail; entries still follow the original D2 rank.
  const ordered = [...openings].sort((a, b) => a.asset < b.asset ? -1 : 1);
  const requests = [...exits].sort((a, b) => a.id < b.id ? -1 : 1);
  return dispatch(s, { id: identity('OPEN', budgetCycleTime(asOf)), kind: 'OPEN', asOf: budgetCycleTime(asOf), openings: ordered, exits: requests });
}
export function processClosedCandle(s: ExecutionState, candles: readonly Candle[], asOf: string): ExecutionState {
  return dispatch(s, { id: identity('CLOSE', budgetCycleTime(asOf)), kind: 'CLOSE', asOf: budgetCycleTime(asOf),
    candles: [...candles].sort((a, b) => a.asset < b.asset ? -1 : 1) });
}
export function projectExecutionBudget(s: ExecutionState): BudgetSnapshot { return budgetProjection(validateExecutionState(s)); }
export function cancelActiveReservation(s: ExecutionState, reservationId: string, reason: string, asOf: string): ExecutionState {
  return dispatch(s, { id: identity('CANCEL', reservationId), kind: 'CANCEL', reservationId, reason, asOf: budgetCycleTime(asOf) });
}

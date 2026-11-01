import { parseFixed8, formatFixed8, divideDown, divideUp, FIXED8_SCALE } from '../budget/fixed8';
import { BudgetSnapshot } from '../budget/types';
import { budgetCycleTime, requireBudget, validateBudgetSnapshot } from '../budget/limits';
import { immutable, same } from '../budget/reservations';
import { Asset } from '../simulation/candle';
import { ExactPrice, ExecutionFill, ExecutionOrder, ExecutionState } from './execution-types';
export { immutable, same, requireBudget, budgetCycleTime };
export const assets = ['BTC', 'ETH'] as const;
export const identity = (...parts: readonly unknown[]): string => JSON.stringify(parts);
export const signed = (n: bigint): string => n < 0n ? `-${formatFixed8(-n)}` : formatFixed8(n);
export function parseSigned(value: string): bigint {
  requireBudget(typeof value === 'string' && value !== '-0.00000000', 'Canonical signed decimal required');
  return value.startsWith('-') ? -parseFixed8(value.slice(1)) : parseFixed8(value);
}
export function exact(numerator: bigint, denominator = 1n): ExactPrice {
  requireBudget(numerator > 0n && denominator > 0n, 'Positive exact price required');
  return { numerator: String(numerator), denominator: String(denominator) };
}
export function executionAmounts(side: 'BUY' | 'SELL', quantity: string, reference: ExactPrice) {
  const q = parseFixed8(quantity), n = BigInt(reference.numerator), d = BigInt(reference.denominator);
  requireBudget(q > 0n && n > 0n && d > 0n && (side === 'BUY' || side === 'SELL'), 'Invalid execution amount/reference');
  // The effective executed price is itself a canonical fixed8 contract value.
  const price = side === 'BUY' ? divideUp(n * 2001n, d * 2000n) : divideDown(n * 1999n, d * 2000n);
  requireBudget(price > 0n, 'Zero effective execution price');
  const gross = side === 'BUY' ? divideUp(q * price, FIXED8_SCALE) : divideDown(q * price, FIXED8_SCALE);
  const fee = divideUp(q * price, FIXED8_SCALE * 1000n);
  const total = side === 'BUY' ? gross + fee : gross - fee;
  requireBudget(total >= 0n, 'Fee exceeds sale receipt');
  return { price: formatFixed8(price), gross: formatFixed8(gross), fee: formatFixed8(fee), total: formatFixed8(total) };
}
export function refresh(s: ExecutionState): ExecutionState {
  let market = 0n, reserved = 0n, risk = 0n, realized = 0n, unrealized = 0n;
  const exposure = { BTC: 0n, ETH: 0n }, positions: BudgetSnapshot['positions'] = { BTC: 'FLAT', ETH: 'FLAT' };
  const views: Record<Asset, 'NONE' | 'ACTIVE'> = { BTC: 'NONE', ETH: 'NONE' };
  for (const r of s.reservations) if (r.status === 'ACTIVE') {
    const cost = parseFixed8(r.source.capital); reserved += cost; exposure[r.source.asset] += cost;
    risk += parseFixed8(r.source.plannedRisk); views[r.source.asset] = 'ACTIVE';
  }
  const positionViews = { ...positions };
  for (const p of s.positions) {
    if (p.status === 'CLOSED') { realized += parseSigned(p.realizedPnl); continue; }
    const mark = s.marks[p.asset];
    requireBudget(mark !== null && positionViews[p.asset] === 'FLAT', 'Missing mark or duplicate open position');
    const value = divideDown(parseFixed8(p.quantity) * parseFixed8(mark), FIXED8_SCALE);
    market += value; exposure[p.asset] += value; risk += parseFixed8(p.plannedRisk);
    unrealized += value - parseFixed8(p.entryCost); positionViews[p.asset] = 'OPEN';
  }
  const cash = parseFixed8(s.availableCash), fees = s.fills.reduce((n, f) => n + parseFixed8(f.fee), 0n);
  const portfolio: BudgetSnapshot = { asOf: s.asOf, state: s.initial.state, equity: formatFixed8(cash + reserved + market),
    dayOpeningEquity: s.dailyBase, availableCash: s.availableCash, reservedCash: formatFixed8(reserved),
    committedExposure: { BTC: formatFixed8(exposure.BTC), ETH: formatFixed8(exposure.ETH) }, committedRisk: formatFixed8(risk),
    positions: positionViews, reservations: views };
  validateBudgetSnapshot(portfolio);
  const orders: ExecutionOrder[] = s.reservations.map(r => ({ id: identity('ORDER', r.source.decisionId),
    decisionId: r.source.decisionId, reservationId: r.source.id, quantity: r.source.quantity,
    status: r.status === 'ACTIVE' ? 'RESERVED' : r.status === 'SETTLED' ? 'FILLED'
      : s.events.some(e => e.id === r.terminalId && e.reason === 'EXPIRED') ? 'EXPIRED' : 'CANCELLED',
    fillId: s.fills.find(f => f.reservationId === r.source.id && f.side === 'BUY')?.id ?? null }));
  return { ...s, portfolio, orders, realizedPnl: signed(realized), unrealizedPnl: signed(unrealized), feesPaid: formatFixed8(fees) };
}
export function initialExecutionState(input: BudgetSnapshot): ExecutionState {
  validateBudgetSnapshot(input);
  requireBudget(input.availableCash === input.equity && input.reservedCash === '0.00000000' && input.committedRisk === '0.00000000'
    && assets.every(a => input.positions[a] === 'FLAT' && input.reservations[a] === 'NONE' && input.committedExposure[a] === '0.00000000'),
    'Initial D4 snapshot must explicitly reconcile cash and no positions/holds');
  const initial = immutable({ ...input, asOf: budgetCycleTime(input.asOf) });
  return immutable(refresh({ initial, asOf: initial.asOf, phase: 'BEFORE_OPEN', portfolio: initial,
    availableCash: initial.availableCash, dailyBase: initial.dayOpeningEquity, marks: { BTC: null, ETH: null }, openingPrices: { BTC: null, ETH: null },
    reservations: [], positions: [], orders: [], origins: [], fills: [], events: [], commands: [], realizedPnl: '0.00000000', unrealizedPnl: '0.00000000', feesPaid: '0.00000000' }));
}
export function audit(before: ExecutionState, after: ExecutionState, kind: string, reason: string, id: string,
  reservationId: string | null = null, positionId: string | null = null, fill: ExecutionFill | null = null, exitRequestId: string | null = null): ExecutionState {
  const next = refresh(after);
  return { ...next, events: [...next.events, { id, kind, reason, asOf: next.asOf, reservationId, positionId, exitRequestId,
    before: before.portfolio, after: next.portfolio, fillId: fill?.id ?? null }] };
}

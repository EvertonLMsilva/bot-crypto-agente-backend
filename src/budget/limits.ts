import { Asset } from '../simulation/candle';
import { FIVE_MINUTES_MS } from '../simulation/clock';
import { parseFixed8, formatFixed8, divideDown } from './fixed8';
import { BudgetLimitEvaluation, BudgetReason, BudgetSnapshot } from './types';

export function requireBudget(condition: unknown, message: string): asserts condition {
  if (!condition) throw new RangeError(message);
}
export function budgetCycleTime(value: string): string {
  requireBudget(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00(?:\.000)?Z$/.test(value), 'Invalid UTC budget cycle');
  const t = Date.parse(value), canonical = value.replace(/(?:\.000)?Z$/, '.000Z');
  requireBudget(Number.isFinite(t) && t % FIVE_MINUTES_MS === 0 && new Date(t).toISOString() === canonical, 'Invalid UTC budget cycle');
  return canonical;
}
/** Parsing/consistency checks only; no balances are created or mutated. */
export function validateBudgetSnapshot(p: BudgetSnapshot) {
  requireBudget(p && typeof p === 'object', 'Explicit budget snapshot required');
  budgetCycleTime(p.asOf);
  requireBudget(['RUNNING', 'RECOVERING', 'ENTRY_SUSPENDED', 'MANUAL_REVIEW_REQUIRED'].includes(p.state), 'Invalid budget state');
  const equity = parseFixed8(p.equity), day = parseFixed8(p.dayOpeningEquity), cash = parseFixed8(p.availableCash), reserved = parseFixed8(p.reservedCash);
  requireBudget(day > 0n && cash + reserved <= equity, 'Inconsistent equity/day/cash snapshot');
  requireBudget(p.committedExposure && p.positions && p.reservations, 'Explicit BTC/ETH budget views required');
  const exposure = { BTC: parseFixed8(p.committedExposure.BTC), ETH: parseFixed8(p.committedExposure.ETH) };
  for (const asset of ['BTC', 'ETH'] as const) {
    requireBudget(['FLAT', 'OPEN', 'UNKNOWN'].includes(p.positions[asset]) && ['NONE', 'ACTIVE', 'UNKNOWN'].includes(p.reservations[asset]), 'Invalid position/reservation view');
  }
  return { equity, day, cash, exposure, risk: parseFixed8(p.committedRisk) };
}
export function evaluateBudgetLimits(p: BudgetSnapshot, asset: Asset, commitment: string, plannedRisk: string): BudgetLimitEvaluation {
  const values = validateBudgetSnapshot(p);
  requireBudget(asset === 'BTC' || asset === 'ETH', 'Invalid budget asset');
  const cost = parseFixed8(commitment), risk = parseFixed8(plannedRisk), e = values.equity;
  const individual = divideDown(e * 20n, 100n), total = divideDown(e * 40n, 100n);
  const operationRisk = divideDown(e, 100n), openRisk = divideDown(e * 2n, 100n), daily = divideDown(values.day * 3n, 100n);
  const individualAfter = values.exposure[asset] + cost, totalAfter = values.exposure.BTC + values.exposure.ETH + cost;
  const riskAfter = values.risk + risk, loss = values.day > e ? values.day - e : 0n;
  const reasons: BudgetReason[] = [];
  if (p.state !== 'RUNNING') reasons.push(`STATE_${p.state}`);
  if (p.positions[asset] !== 'FLAT') reasons.push(`POSITION_${p.positions[asset]}` as BudgetReason);
  if (p.reservations[asset] !== 'NONE') reasons.push(`RESERVATION_${p.reservations[asset]}` as BudgetReason);
  if (individualAfter > individual) reasons.push('INDIVIDUAL_EXPOSURE_LIMIT');
  if (totalAfter > total) reasons.push('TOTAL_EXPOSURE_LIMIT');
  if (risk > operationRisk) reasons.push('OPERATION_RISK_LIMIT');
  if (riskAfter > openRisk) reasons.push('OPEN_RISK_LIMIT');
  // The daily block is an exact >=3% comparison, not a rounded money threshold.
  if (loss * 100n >= values.day * 3n) reasons.push('DAILY_LOSS_LIMIT');
  if (cost > values.cash) reasons.push('INSUFFICIENT_AVAILABLE_CASH');
  return Object.freeze({ eligible: reasons.length === 0, reasons: Object.freeze(reasons), limits: Object.freeze({
    referenceInitialCapital: '10000.00000000', targetExposure: formatFixed8(divideDown(e, 10n)),
    individualExposure: formatFixed8(individual), totalExposure: formatFixed8(total), operationRisk: formatFixed8(operationRisk),
    openRisk: formatFixed8(openRisk), dailyLoss: formatFixed8(daily) }), projected: Object.freeze({
    individualExposure: formatFixed8(individualAfter), totalExposure: formatFixed8(totalAfter), openRisk: formatFixed8(riskAfter), dailyLoss: formatFixed8(loss) }) });
}

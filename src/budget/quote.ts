import { CoordinationResult } from '../coordination/types';
import { DecisionEnvelope } from '../operations/types';
import { compare, deserialize } from '../signals/exact-technical-score';
import { SignalAssessment } from '../signals/types';
import { FIXED8_SCALE, parseFixed8, formatFixed8, divideDown, divideUp } from './fixed8';
import { budgetCycleTime, evaluateBudgetLimits, requireBudget, validateBudgetSnapshot } from './limits';
import { BudgetEstimates, BudgetQuote, BudgetReason, BudgetSnapshot, ClosedPriceReference } from './types';

function sameAssessment(a: SignalAssessment, b: SignalAssessment): boolean {
  if (!a || !b) return false;
  // C may use equivalent exact fractions after D2/FIX-001; no normalization of
  // scores, indicators or ranking, and no write to the original evidence.
  const normalized = (v: SignalAssessment) => Object.fromEntries(Object.keys(v).sort().map(k => [k, k === 'C' ? null : v[k as keyof SignalAssessment]]));
  return a.C !== null && b.C !== null && compare(deserialize(a.C), deserialize(b.C)) === 0
    && JSON.stringify(normalized(a)) === JSON.stringify(normalized(b));
}
function opportunity(b: CoordinationResult, rank: number): DecisionEnvelope {
  requireBudget(b && Array.isArray(b.opportunities) && Array.isArray(b.waits) && b.audit && Array.isArray(b.audit.ranking)
    && b.financialAuthorization === 'NOT_EVALUATED' && b.execution === 'NOT_EXECUTED', 'Explicit D2 coordination result required');
  budgetCycleTime(b.asOf);
  requireBudget(Number.isInteger(rank) && rank >= 1 && rank <= b.opportunities.length && b.audit.ranking.length === b.opportunities.length, 'Rank must exist in the original D2 ranking (one-based)');
  const d = b.opportunities[rank - 1]!, r = b.audit.ranking[rank - 1]!, c = d?.candidate;
  requireBudget(d && d.type === 'ENTRY_CANDIDATE' && c && c.qualified && c.technicalEligible && c.G === 1 && c.H === 0
    && Number.isInteger(c.scoreRounded) && c.scoreRounded! >= 70 && c.scoreRounded! <= 100
    && d.position?.status === 'FLAT' && d.position.asset === d.asset && d.position.asOf === d.asOf
    && d.financialAuthorization === 'NOT_EVALUATED' && d.execution === 'NOT_EXECUTED' && d.validity === 'NEXT_ELIGIBLE_OPEN_ONLY', 'Valid D2 entry proposal required');
  requireBudget([60, 80, 90, 100].includes(c.R!) && [50, 100].includes(c.A!)
    && [c.F, c.Q, c.V, c.T, c.C, c.scoreRaw].every(v => v !== null && deserialize(v).numerator >= 0n), 'Invalid selected technical evidence');
  const signal = budgetCycleTime(d.asOf), cycle = budgetCycleTime(b.asOf);
  requireBudget(signal <= cycle, 'Future signal cannot be quoted');
  requireBudget((d.asset === 'BTC' || d.asset === 'ETH') && c.asset === d.asset && c.closeTime === d.asOf && c.policyId === d.policyId
    && c.policyVersion === d.policyVersion && d.audit?.decisionId === d.id && d.audit.asset === d.asset && d.audit.asOf === d.asOf
    && d.audit.policyId === d.policyId && d.audit.policyVersion === d.policyVersion && d.audit.type === d.type
    && d.audit.position?.asset === d.asset && d.audit.position.asOf === d.asOf && d.audit.position.status === 'FLAT'
    && d.exitEvaluation === 'NOT_APPLICABLE' && d.audit.exitEvaluation === d.exitEvaluation
    && Array.isArray(d.reasons) && d.reasons.length === 1 && d.reasons[0] === 'QUALIFIED_REPRESENTATIVE'
    && Array.isArray(d.audit.reasons) && d.audit.reasons.length === 1 && d.audit.reasons[0] === d.reasons[0], 'Inconsistent decision origin');
  requireBudget(d.id === JSON.stringify([d.asset, d.asOf, d.policyId, d.policyVersion, c.familyId, c.familyVersion, d.type])
    && c.id === JSON.stringify([c.asset, c.closeTime, c.policyId, c.policyVersion, c.familyId, c.familyVersion]), 'Invalid decision/assessment identity');
  const selection = d.audit.selection;
  requireBudget(selection && selection.asset === d.asset && selection.asOf === d.asOf && selection.policyId === d.policyId
    && selection.policyVersion === d.policyVersion && selection.context?.status === 'VALID' && selection.context.C !== null
    && Array.isArray(selection.assessments) && selection.assessments.length === 3 && selection.representative
    && sameAssessment(c, selection.representative) && selection.assessments.some((a: SignalAssessment) => sameAssessment(a, c))
    && selection.assessments.every((a: SignalAssessment, i: number) => a && a.family === ['TREND', 'BREAKOUT', 'MEAN_REVERSION'][i]
      && a.asset === d.asset && a.closeTime === d.asOf && a.policyId === d.policyId && a.policyVersion === d.policyVersion
      && a.C !== null && compare(deserialize(a.C), deserialize(selection.context.C!)) === 0), 'Inconsistent specialist evidence');
  requireBudget(r && r.rank === rank && r.decisionId === d.id && r.asset === d.asset && r.asOf === d.asOf && r.policyId === d.policyId
    && r.policyVersion === d.policyVersion && r.strategyId === c.familyId && r.strategyVersion === c.familyVersion
    && r.scoreRounded === c.scoreRounded, 'D2 ranking origin mismatch');
  return d;
}

/** Advisory estimate only, using the original D2 rank. No authorization,
 * reservation or execution, and no re-ranking or score recalculation.
 */
export function evaluateBudgetQuote(coordinated: CoordinationResult, rank: number, portfolio: BudgetSnapshot, price: ClosedPriceReference): BudgetQuote {
  const d = opportunity(coordinated, rank), values = validateBudgetSnapshot(portfolio);
  const cycle = budgetCycleTime(coordinated.asOf);
  requireBudget(budgetCycleTime(portfolio.asOf) === cycle, 'Budget snapshot must match the batch frontier');
  requireBudget(price && price.validatedClosed === true && price.asset === d.asset && budgetCycleTime(price.closeTime) === budgetCycleTime(d.asOf), 'Validated closed price must match the signal asset/candle');
  const close = parseFixed8(price.close);
  requireBudget(close > 0n, 'Positive closed price required');
  const reasons: BudgetReason[] = [];
  let estimates: BudgetEstimates | null = null, total = 0n, risk = 0n;
  if (budgetCycleTime(d.asOf) !== cycle) reasons.push('STALE_SIGNAL');
  else {
    // Quantize quantity only after the exact equity/10/close division.
    const quantity = divideDown(values.equity * FIXED8_SCALE, 10n * close);
    // Price multiplier: 1.01 * 1.0005 = 202101/200000. Keep it exact
    // through all products; displayed prices never feed later arithmetic.
    const buyN = close * 202101n, buyD = 200000n;
    const grossN = quantity * buyN, grossD = FIXED8_SCALE * buyD;
    const gross = divideUp(grossN, grossD), fee = divideUp(grossN, grossD * 1000n);
    total = gross + fee;
    // Stop is2% below estimated entry; sell slippage appears once in gross.
    // Quantize the sell fee UP before subtracting it, then floor the net.
    // Existing unsigned helpers reject a fee exceeding gross proceeds.
    const sellN = grossN * 98n * 1999n, sellD = grossD * 100n * 2000n;
    const sellFee = divideUp(sellN, sellD * 1000n);
    const net = divideDown(sellN - sellFee * sellD, sellD);
    risk = total - net;
    if (quantity === 0n) reasons.push('ZERO_QUANTITY');
    estimates = Object.freeze({ quantity: formatFixed8(quantity), exposureReference: formatFixed8(divideUp(quantity * close, FIXED8_SCALE)),
      conservativeBuyPrice: formatFixed8(divideUp(buyN, buyD)), grossCommitment: formatFixed8(gross), buyFee: formatFixed8(fee),
      totalCommitment: formatFixed8(total), stopPrice: formatFixed8(divideDown(buyN * 98n, buyD * 100n)),
      stopNetReceipt: formatFixed8(net), plannedRisk: formatFixed8(risk) });
  }
  const limits = evaluateBudgetLimits(portfolio, d.asset, formatFixed8(total), formatFixed8(risk));
  reasons.push(...limits.reasons);
  return Object.freeze({ decisionId: d.id, rank, asset: d.asset, asOf: cycle, signalAsOf: d.asOf, policyId: d.policyId, policyVersion: d.policyVersion,
    strategyId: d.candidate!.familyId, strategyVersion: d.candidate!.familyVersion, price: Object.freeze({ asset: price.asset,
      closeTime: price.closeTime, close: price.close, validatedClosed: price.validatedClosed }), status: reasons.length === 0 ? 'QUOTABLE' : 'NOT_QUOTABLE',
    estimates, limits, reasons: Object.freeze(reasons), financialAuthorization: 'NOT_EVALUATED', reservation: 'NOT_CREATED', execution: 'NOT_EXECUTED' });
}

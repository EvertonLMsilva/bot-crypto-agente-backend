import { DecisionEnvelope } from '../operations/types';
import { SignalAssessment, SerializedFraction } from '../signals/types';
import { compare, deserialize } from '../signals/exact-technical-score';
import { Asset } from '../simulation/candle';
import { compareEntryPriority, cycleMilliseconds, priorityCriterion } from './priority';
import { CoordinationResult, CoordinatorState, RankingRecord, TieRecord } from './types';

function requireValid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new RangeError(message);
}
const identifier = (value: unknown): boolean => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value);
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/** Canonical JSON copy: property insertion order is not content. Freeze copies
 * only; cycles, non-JSON objects, undefined and non-finite values are rejected.
 */
function snapshot<T>(value: T, ancestors = new Set<object>()): T {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  requireValid(typeof value === 'object' && !ancestors.has(value), 'Non-serializable decision evidence');
  requireValid(Array.isArray(value) || Object.prototype.toString.call(value) === '[object Object]', 'Non-JSON decision evidence');
  ancestors.add(value);
  const result = Array.isArray(value) ? Array.from(value, v => snapshot(v, ancestors))
    : Object.fromEntries(Object.keys(value).sort().map(key => [key, snapshot((value as Record<string, unknown>)[key], ancestors)]));
  ancestors.delete(value);
  return Object.freeze(result) as T;
}
function fraction(value: SerializedFraction | null): boolean {
  return value !== null && typeof value === 'object' && typeof value.numerator === 'string' && typeof value.denominator === 'string'
    && /^(0|[1-9]\d*)$/.test(value.numerator) && /^[1-9]\d*$/.test(value.denominator);
}
function sameContext(a: SerializedFraction | null, b: SerializedFraction | null): boolean {
  if (a === null || b === null) return a === b;
  requireValid(fraction(a) && fraction(b), 'Invalid contextual fraction');
  return compare(deserialize(a), deserialize(b)) === 0;
}
// Only C permits equivalent rational representations here. All other evidence
// retains the existing structural comparison; no score or analysis is recalculated.
function sameAssessment(a: SignalAssessment, b: SignalAssessment): boolean {
  return !!a && !!b && sameContext(a.C, b.C) && same({ ...a, C: null }, { ...b, C: null });
}
function validateAssessment(a: SignalAssessment, d: DecisionEnvelope): void {
  requireValid(a && a.asset === d.asset && a.closeTime === d.asOf && a.policyId === d.policyId && a.policyVersion === d.policyVersion
    && identifier(a.familyId) && identifier(a.familyVersion), 'Assessment origin mismatch');
  requireValid(a.id === JSON.stringify([a.asset, a.closeTime, a.policyId, a.policyVersion, a.familyId, a.familyVersion]), 'Invalid assessment ID');
  requireValid(a.H === 0 && (a.G === 0 || a.G === 1) && typeof a.qualified === 'boolean' && typeof a.technicalEligible === 'boolean'
    && typeof a.agreementParticipant === 'boolean' && Array.isArray(a.reasons) && a.reasons.every(r => typeof r === 'string')
    && typeof a.technicalReason === 'string' && (a.R === null || [60, 80, 90, 100].includes(a.R))
    && (a.A === null || a.A === 50 || a.A === 100) && (a.TApproximate === null || typeof a.TApproximate === 'number'), 'Invalid assessment evidence');
  requireValid([a.F, a.Q, a.V, a.T, a.C, a.scoreRaw].every(v => v === null || fraction(v)), 'Invalid exact fraction');
  requireValid(a.scoreRounded === null || (Number.isInteger(a.scoreRounded) && a.scoreRounded >= 0 && a.scoreRounded <= 100), 'Invalid rounded score');
  if (a.qualified) requireValid(a.technicalEligible && a.G === 1 && a.T !== null && a.C !== null && a.scoreRaw !== null
    && a.scoreRounded !== null && a.scoreRounded >= 70 && [60, 80, 90, 100].includes(a.R!) && [50, 100].includes(a.A!), 'Unqualified operational candidate');
}
function validateDecision(d: DecisionEnvelope, frontier: number): void {
  requireValid(d && typeof d === 'object' && Object.keys(d).length === 14 && (d.asset === 'BTC' || d.asset === 'ETH')
    && d.policyId === `${d.asset}-P0` && identifier(d.policyVersion) && Array.isArray(d.reasons)
    && (d.type === 'ENTRY_CANDIDATE' || d.type === 'WAIT'), 'Invalid D1 envelope');
  const time = cycleMilliseconds(d.asOf);
  requireValid(time <= frontier && new Date(time).toISOString() === d.asOf, 'Future or noncanonical decision cycle');
  requireValid(d.financialAuthorization === 'NOT_EVALUATED' && d.execution === 'NOT_EXECUTED', 'Unexpected financial state');
  requireValid(d.position && d.position.asset === d.asset && d.position.asOf === d.asOf
    && ['FLAT', 'OPEN', 'UNKNOWN'].includes(d.position.status), 'Invalid position snapshot');
  const audit = d.audit;
  requireValid(audit && audit.decisionId === d.id && audit.asset === d.asset && audit.asOf === d.asOf && audit.policyId === d.policyId
    && audit.policyVersion === d.policyVersion && audit.type === d.type && same(audit.position, d.position)
    && same(audit.reasons, d.reasons) && audit.exitEvaluation === d.exitEvaluation, 'D1 audit metadata mismatch');
  const selection = audit.selection;
  requireValid(selection && selection.asset === d.asset && selection.asOf === d.asOf && selection.policyId === d.policyId
    && selection.policyVersion === d.policyVersion && Array.isArray(selection.assessments) && selection.assessments.length === 3, 'Invalid selection snapshot');
  const families = ['TREND', 'BREAKOUT', 'MEAN_REVERSION'];
  selection.assessments.forEach((a, i) => {
    requireValid(a && a.family === families[i], 'Invalid technical families');
    validateAssessment(a, d);
  });
  const context = selection.context;
  requireValid(context && ['VALID', 'UNAVAILABLE'].includes(context.status) && Array.isArray(context.groups)
    && (context.status === 'VALID' ? fraction(context.C) : context.C === null), 'Invalid context snapshot');
  requireValid(selection.assessments.every(a => sameContext(context.C, a.C)), 'Context C differs from assessment evidence');
  const representative = selection.representative;
  requireValid(representative === null ? !selection.assessments.some(a => a.qualified)
    : representative && representative.qualified && context.status === 'VALID'
      && selection.assessments.some(a => a.id === representative.id && sameAssessment(a, representative)), 'Representative audit mismatch');
  const rejected = selection.assessments.filter(a => a.id !== representative?.id);
  requireValid(Array.isArray(selection.discarded) && selection.discarded.length === rejected.length
    && selection.discarded.every((item, i) => item && sameAssessment(item.assessment, rejected[i]!)
      && item.reason === (rejected[i]!.qualified ? 'LOWER_RANKED' : 'NOT_QUALIFIED')), 'Discarded evidence mismatch');
  const open = d.position.status === 'OPEN', unknown = d.position.status === 'UNKNOWN';
  const reason = open ? 'POSITION_OPEN' : unknown ? 'POSITION_UNKNOWN'
    : representative === null ? 'NO_QUALIFIED_REPRESENTATIVE' : 'QUALIFIED_REPRESENTATIVE';
  requireValid(d.reasons.length === 1 && d.reasons[0] === reason && d.exitEvaluation === (open ? 'EXIT_EVALUATION_PENDING'
    : unknown ? 'NOT_EVALUATED' : 'NOT_APPLICABLE'), 'Invalid WAIT/position semantics');
  if (d.type === 'ENTRY_CANDIDATE') {
    requireValid(!open && !unknown && representative !== null && d.candidate !== null && sameAssessment(d.candidate, representative)
      && d.validity === 'NEXT_ELIGIBLE_OPEN_ONLY', 'Invalid entry proposal');
  } else requireValid(d.candidate === null && d.validity === 'CURRENT_CYCLE_ONLY'
    && (open || unknown || representative === null), 'Invalid WAIT proposal');
  const origin = d.type === 'ENTRY_CANDIDATE' ? representative : null;
  requireValid(d.id === JSON.stringify([d.asset, d.asOf, d.policyId, d.policyVersion, origin?.familyId ?? null,
    origin?.familyVersion ?? null, d.type]), 'Invalid decision identity');
}

export function coordinateEntryBatch(decisions: readonly DecisionEnvelope[], asOf: string, state: CoordinatorState): CoordinationResult {
  const frontier = cycleMilliseconds(asOf);
  requireValid(state && (state.nextTieAsset === 'BTC' || state.nextTieAsset === 'ETH'), 'Explicit BTC/ETH tie preference required');
  requireValid(Array.isArray(decisions), 'Decision batch must be an array');
  const previousState = Object.freeze({ nextTieAsset: state.nextTieAsset });
  const byId = new Map<string, DecisionEnvelope>(), cycles = new Set<string>(), duplicates = new Map<string, number>();
  for (const input of decisions) {
    const decision = snapshot(input);
    validateDecision(decision, frontier);
    const existing = byId.get(decision.id);
    if (existing) {
      requireValid(same(existing, decision), 'Divergent content for the same decision ID');
      duplicates.set(decision.id, (duplicates.get(decision.id) ?? 0) + 1);
      continue;
    }
    const cycle = JSON.stringify([decision.asset, decision.asOf]);
    requireValid(!cycles.has(cycle), 'Conflicting official decisions for the same asset/cycle');
    cycles.add(cycle); byId.set(decision.id, decision);
  }
  const entries = [...byId.values()].filter(d => d.type === 'ENTRY_CANDIDATE')
    .sort((a, b) => compareEntryPriority(a, b, previousState.nextTieAsset));
  const waits = [...byId.values()].filter(d => d.type === 'WAIT').sort((a, b) => a.id < b.id ? -1 : 1);
  const opportunities: DecisionEnvelope[] = [], ties: TieRecord[] = [];
  let nextTieAsset: Asset = previousState.nextTieAsset;
  for (let i = 0; i < entries.length;) {
    let end = i + 1;
    while (end < entries.length && entries[end]!.asOf === entries[i]!.asOf
      && entries[end]!.candidate!.scoreRounded === entries[i]!.candidate!.scoreRounded) end++;
    const group = entries.slice(i, end).sort((a, b) => compareEntryPriority(a, b, nextTieAsset));
    if (new Set(group.map(d => d.asset)).size > 1) {
      const preferredAsset = nextTieAsset;
      nextTieAsset = preferredAsset === 'BTC' ? 'ETH' : 'BTC';
      ties.push(Object.freeze({ scoreRounded: group[0]!.candidate!.scoreRounded!, signalAsOf: group[0]!.asOf,
        decisionIds: Object.freeze(group.map(d => d.id)), preferredAsset, nextTieAsset }));
    }
    opportunities.push(...group); i = end;
  }
  const nextState = Object.freeze({ nextTieAsset });
  const ranking = opportunities.map((d, i): RankingRecord => {
    const other = opportunities[i === 0 ? 1 : i - 1];
    return Object.freeze({ rank: i + 1, decisionId: d.id, asset: d.asset, asOf: d.asOf, policyId: d.policyId, policyVersion: d.policyVersion,
      strategyId: d.candidate!.familyId, strategyVersion: d.candidate!.familyVersion, scoreRounded: d.candidate!.scoreRounded!,
      criterion: other ? priorityCriterion(d, other) : 'ONLY_OPPORTUNITY', comparedWith: other?.id ?? null });
  });
  return Object.freeze({ asOf: new Date(frontier).toISOString(), opportunities: Object.freeze(opportunities), waits: Object.freeze(waits), nextState,
    financialAuthorization: 'NOT_EVALUATED', execution: 'NOT_EXECUTED', audit: Object.freeze({ previousState, nextState,
      ranking: Object.freeze(ranking), ties: Object.freeze(ties), duplicates: Object.freeze([...duplicates.keys()].sort()
        .map(decisionId => Object.freeze({ decisionId, ignoredCount: duplicates.get(decisionId)! }))) }) });
}

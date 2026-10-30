import { Candle } from '../simulation/candle';
import { FIVE_MINUTES_MS } from '../simulation/clock';
import { ActivePolicy, ContextFeed, evaluateSignalCandidates } from '../signals';
import { createDecisionAudit } from './audit';
import { DecisionEnvelope, DecisionReason, DecisionType, ExitEvaluation, PositionView } from './types';

function cycleTime(value: string): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00(?:\.000)?Z$/.test(value)) {
    throw new RangeError('Decision requires an explicit UTC five-minute boundary');
  }
  const milliseconds = Date.parse(value), canonical = value.replace(/(?:\.000)?Z$/, '.000Z');
  if (!Number.isFinite(milliseconds) || milliseconds % FIVE_MINUTES_MS !== 0
    || new Date(milliseconds).toISOString() !== canonical) throw new RangeError('Invalid decision cycle time');
  return canonical;
}

/** One proposal for new entries only. WAIT for an OPEN position explicitly
 * leaves strategic exits pending; it must not be interpreted as HOLD.
 */
export function prepareSimulatedDecision(candles5m: readonly Candle[], asOf: string, contextFeed: ContextFeed,
  activePolicy: ActivePolicy, position: PositionView): DecisionEnvelope {
  const instant = cycleTime(asOf), asset = candles5m.at(-1)?.asset;
  if (!position || position.asset !== asset || !['FLAT', 'OPEN', 'UNKNOWN'].includes(position.status)
    || cycleTime(position.asOf) !== instant) throw new RangeError('Position must explicitly match the asset and cycle');
  const selection = evaluateSignalCandidates(candles5m, instant, contextFeed, activePolicy);
  if (selection.asset !== asset || selection.asOf !== instant || selection.policyId !== activePolicy.id
    || selection.policyVersion !== activePolicy.version || (selection.representative !== null && !selection.representative.qualified)) {
    throw new RangeError('Signal selection must match the qualified snapshot contract');
  }
  const selected = selection.representative;
  const type: DecisionType = position.status === 'FLAT' && selected !== null ? 'ENTRY_CANDIDATE' : 'WAIT';
  const reason: DecisionReason = position.status === 'OPEN' ? 'POSITION_OPEN'
    : position.status === 'UNKNOWN' ? 'POSITION_UNKNOWN'
      : selected === null ? 'NO_QUALIFIED_REPRESENTATIVE' : 'QUALIFIED_REPRESENTATIVE';
  const exitEvaluation: ExitEvaluation = position.status === 'OPEN' ? 'EXIT_EVALUATION_PENDING'
    : position.status === 'UNKNOWN' ? 'NOT_EVALUATED' : 'NOT_APPLICABLE';
  const origin = type === 'ENTRY_CANDIDATE' ? selected : null;
  const id = JSON.stringify([selection.asset, instant, selection.policyId, selection.policyVersion,
    origin?.familyId ?? null, origin?.familyVersion ?? null, type]);
  const audit = createDecisionAudit({ decisionId: id, asset: selection.asset, asOf: instant,
    policyId: selection.policyId, policyVersion: selection.policyVersion, type,
    position: { asset: position.asset, asOf: instant, status: position.status }, reasons: [reason], exitEvaluation, selection });
  return Object.freeze({ id, asset: audit.asset, asOf: instant, policyId: audit.policyId, policyVersion: audit.policyVersion,
    type, position: audit.position, reasons: audit.reasons, exitEvaluation,
    candidate: type === 'ENTRY_CANDIDATE' ? audit.selection.representative : null,
    validity: type === 'ENTRY_CANDIDATE' ? 'NEXT_ELIGIBLE_OPEN_ONLY' : 'CURRENT_CYCLE_ONLY',
    financialAuthorization: 'NOT_EVALUATED', execution: 'NOT_EXECUTED', audit });
}

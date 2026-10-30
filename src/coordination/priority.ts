import { DecisionEnvelope } from '../operations/types';
import { Asset } from '../simulation/candle';
import { FIVE_MINUTES_MS } from '../simulation/clock';
import { PriorityCriterion } from './types';

export function cycleMilliseconds(value: string): number {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00(?:\.000)?Z$/.test(value)) throw new RangeError('Invalid UTC cycle');
  const time = Date.parse(value), canonical = value.replace(/(?:\.000)?Z$/, '.000Z');
  if (!Number.isFinite(time) || time % FIVE_MINUTES_MS !== 0 || new Date(time).toISOString() !== canonical) throw new RangeError('Invalid UTC cycle');
  return time;
}

/** Inputs have passed D1 validation. Raw score never participates in ranking. */
export function priorityCriterion(a: DecisionEnvelope, b: DecisionEnvelope): PriorityCriterion {
  if (a.candidate!.scoreRounded !== b.candidate!.scoreRounded) return 'SCORE_ROUNDED';
  if (a.asOf !== b.asOf) return 'SIGNAL_TIME';
  if (a.asset !== b.asset) return 'ROUND_ROBIN';
  return 'CANONICAL_ID';
}
export function compareEntryPriority(a: DecisionEnvelope, b: DecisionEnvelope, preferred: Asset): number {
  const score = b.candidate!.scoreRounded! - a.candidate!.scoreRounded!;
  if (score !== 0) return score;
  const time = cycleMilliseconds(a.asOf) - cycleMilliseconds(b.asOf);
  if (time !== 0) return time;
  if (a.asset !== b.asset) return a.asset === preferred ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

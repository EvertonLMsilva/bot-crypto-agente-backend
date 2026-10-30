import { DecisionAudit } from './types';

/** Copy before freezing: no caller-owned object is modified or frozen.
 * C3 fractions already use strings; unsupported values must never be silently
 * dropped or converted by JSON serialization (in particular bigint/NaN).
 */
function copyFrozen<T>(value: T): T {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return Object.freeze(value.map(item => copyFrozen(item))) as T;
  if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, child]) => [key, copyFrozen(child)]))) as T;
  }
  throw new RangeError('Audit requires finite JSON-serializable evidence');
}

export function createDecisionAudit(evidence: DecisionAudit): DecisionAudit {
  return copyFrozen(evidence);
}

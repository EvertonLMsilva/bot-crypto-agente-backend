import { Asset } from '../simulation/candle';
import { add, clip, rational, serialize, subtract } from './exact-technical-score';
import { ContextEvent, ContextFeed, ContextGroup, ContextImpact, ContextResult, ContextState } from './types';
const durations = { CRYPTO: 21600000n, MACRO: 86400000n, GEOPOLITICAL_REGULATORY: 259200000n };
function requireValid(condition: unknown, code: string): asserts condition { if (!condition)
    throw new RangeError(code); }
const identifier = (v: unknown): boolean => typeof v === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(v);
export function utcMilliseconds(value: string): bigint {
    requireValid(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value), 'INVALID_TIMESTAMP');
    const t = Date.parse(value), canonical = value.endsWith('.000Z') || value.includes('.') ? value : value.replace('Z', '.000Z');
    requireValid(Number.isFinite(t) && new Date(t).toISOString() === canonical, 'INVALID_TIMESTAMP');
    return BigInt(t);
}
function fingerprint(e: ContextEvent): string {
    return JSON.stringify([e.eventId, e.groupId, e.revision, e.previousEventId, e.source, e.publishedAt, e.availableAt, e.sequence, e.category, e.state,
        e.impacts.BTC ? [e.impacts.BTC.direction, e.impacts.BTC.intensity] : null, e.impacts.ETH ? [e.impacts.ETH.direction, e.impacts.ETH.intensity] : null]);
}
/** All structure/links are validated; only events published AND available at the
 * frontier contribute. Group lifetime starts at its first available observation
 * and is inherited by confirmations/corrections/republications, never restarted.
 */
export function contextC(feed: ContextFeed, asset: Asset, asOf: string): ContextResult {
    try {
        const now = utcMilliseconds(asOf);
        requireValid(asset === 'BTC' || asset === 'ETH', 'INVALID_ASSET');
        requireValid(feed && feed.status === 'VALID' && Array.isArray(feed.events), 'INVALID_FEED');
        const byId = new Map<string, ContextEvent>(), sequences = new Set<number>(), categories = new Map<string, string>();
        for (const event of feed.events) {
            requireValid(event && typeof event === 'object' && Object.keys(event).length === 11
                && identifier(event.eventId) && identifier(event.groupId) && typeof event.source === 'string' && event.source.trim().length > 0
                && Number.isSafeInteger(event.revision) && event.revision >= 1 && Number.isSafeInteger(event.sequence) && event.sequence >= 1
                && (event.previousEventId === null || identifier(event.previousEventId))
                && Object.hasOwn(durations, event.category) && ['RUMOR', 'CONFIRMED', 'RETRACTED', 'UNCERTAIN'].includes(event.state), 'INVALID_EVENT');
            const published = utcMilliseconds(event.publishedAt), available = utcMilliseconds(event.availableAt);
            requireValid(available >= published, 'INVALID_TIMESTAMP');
            requireValid(event.impacts && typeof event.impacts === 'object' && !Array.isArray(event.impacts)
                && Object.keys(event.impacts).every(a => a === 'BTC' || a === 'ETH')
                && (event.state === 'RETRACTED' || Object.keys(event.impacts).length > 0), 'INVALID_IMPACTS');
            for (const value of Object.values(event.impacts)) {
                const impact = value as ContextImpact | undefined;
                requireValid(impact && Object.keys(impact).length === 2
                    && [-1, 0, 1].includes(impact.direction) && [10, 20, 30].includes(impact.intensity), 'INVALID_IMPACTS');
            }
            const prior = byId.get(event.eventId);
            if (prior) {
                requireValid(fingerprint(prior) === fingerprint(event), 'DIVERGENT_EVENT_ID');
                continue;
            }
            requireValid(!sequences.has(event.sequence), 'INVALID_SEQUENCE');
            sequences.add(event.sequence);
            requireValid(!categories.has(event.groupId) || categories.get(event.groupId) === event.category, 'INCONSISTENT_CATEGORY');
            categories.set(event.groupId, event.category);
            byId.set(event.eventId, event);
        }
        for (const event of byId.values()) {
            if (event.previousEventId === null) {
                requireValid(event.revision === 1 && event.state !== 'RETRACTED', 'INCONSISTENT_REVISION');
                continue;
            }
            const previous = byId.get(event.previousEventId);
            requireValid(previous && previous.groupId === event.groupId && event.revision === previous.revision + 1
                && event.sequence > previous.sequence && utcMilliseconds(event.availableAt) >= utcMilliseconds(previous.availableAt)
                && utcMilliseconds(event.publishedAt) >= utcMilliseconds(previous.publishedAt), 'INCONSISTENT_REVISION');
        }
        const visible = [...byId.values()].filter(e => utcMilliseconds(e.publishedAt) <= now && utcMilliseconds(e.availableAt) <= now)
            .sort((a, b) => a.sequence - b.sequence);
        const grouped = new Map<string, ContextEvent[]>();
        for (const e of visible) {
            const group = grouped.get(e.groupId) ?? [];
            group.push(e);
            grouped.set(e.groupId, group);
        }
        const groups: ContextGroup[] = [];
        let impactSum = rational(0n), U = 0;
        for (const groupId of [...grouped.keys()].sort()) {
            const events = grouped.get(groupId)!;
            if (!events.some(e => e.impacts[asset] !== undefined))
                continue;
            const anchor = events.map(e => utcMilliseconds(e.availableAt)).reduce((a, b) => a < b ? a : b);
            const duration = durations[events[0]!.category], remaining = duration - (now - anchor);
            const superseded = new Set(events.map(e => e.previousEventId));
            // Retractions remain terminal candidates until semantic conflicts
            // are resolved; a sibling confirmation cannot silently override one.
            const tips = events.filter(e => !superseded.has(e.eventId) && (e.state === 'RETRACTED' || e.impacts[asset] !== undefined));
            let state: ContextGroup['state'] = 'RETRACTED', contribution = rational(0n), rumorPenalty: 0 | 5 = 0;
            if (remaining <= 0n)
                state = 'EXPIRED';
            else if (tips.length > 0) {
                const meanings = new Set(tips.map(e => JSON.stringify(e.state === 'RETRACTED'
                    ? [e.state] : [e.state, e.impacts[asset]!.direction, e.impacts[asset]!.intensity])));
                state = tips.some(e => e.state === 'UNCERTAIN') || meanings.size > 1 ? 'UNCERTAIN' : tips[0]!.state as ContextState;
                if (tips.some(e => e.state === 'RUMOR'))
                    rumorPenalty = 5;
                if (state === 'CONFIRMED') {
                    const impact = tips[0]!.impacts[asset]!;
                    contribution = rational(BigInt(impact.direction) * BigInt(impact.intensity) * remaining, duration);
                }
            }
            U = Math.min(10, U + rumorPenalty);
            impactSum = add(impactSum, contribution);
            groups.push(Object.freeze({ groupId, state, eventIds: Object.freeze(events.map(e => e.eventId)),
                anchorTime: new Date(Number(anchor)).toISOString(), contribution: serialize(contribution), rumorPenalty }));
        }
        return Object.freeze({ status: 'VALID', C: serialize(clip(subtract(add(rational(50n), impactSum), rational(BigInt(U))), 100n)),
            U, groups: Object.freeze(groups), reason: 'VALID_FEED' });
    }
    catch (error) {
        if (!(error instanceof RangeError))
            throw error;
        return Object.freeze({ status: 'UNAVAILABLE', C: null, U: 0, groups: Object.freeze([]), reason: error.message });
    }
}

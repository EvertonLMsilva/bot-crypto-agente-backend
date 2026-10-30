import { Asset, Candle } from '../simulation/candle';
import { evaluateTechnicalStrategies, TECHNICAL_FAMILIES, TechnicalFamily } from '../strategies';
import { contextC } from './context';
import { compare, deserialize, exactTechnicalScores, rational } from './exact-technical-score';
import { regimeFit } from './regime-fit';
import { globalScore } from './score';
import { ActivePolicy, ContextFeed, SerializedFraction, SignalAssessment, SignalSelection } from './types';
interface AgreementInput {
    readonly asset: Asset;
    readonly policyId: string;
    readonly policyVersion: string;
    readonly policyState: 'UNVALIDATED';
    readonly family: TechnicalFamily;
    readonly familyId: string;
    readonly eligible: boolean;
    readonly T: SerializedFraction | null;
}
export function agreement(input: readonly AgreementInput[]): readonly Readonly<{
    A: 50 | 100 | null;
    participant: boolean;
}>[] {
    const first = input[0], families = new Set<string>(), ids = new Set<string>();
    for (const item of input) {
        if (item.asset !== first!.asset || item.policyId !== first!.policyId || item.policyVersion !== first!.policyVersion
            || item.policyState !== 'UNVALIDATED' || !TECHNICAL_FAMILIES.includes(item.family)
            || families.has(item.family) || ids.has(item.familyId))
            throw new RangeError('Mixed or duplicated agreement identity');
        families.add(item.family);
        ids.add(item.familyId);
    }
    const participants = input.map(a => a.eligible && a.T !== null && compare(deserialize(a.T), rational(60n)) >= 0);
    const qualified = participants.filter(Boolean).length >= 2;
    return Object.freeze(input.map((a, i) => Object.freeze({ A: !a.eligible ? null : qualified && participants[i] ? 100 : 50,
        participant: qualified && participants[i] === true })));
}
const id = (s: unknown): boolean => typeof s === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(s);
function validatePolicy(policy: ActivePolicy, asset: Asset | undefined): void {
    if (!policy || Object.keys(policy).length !== 5 || policy.asset !== asset || !['BTC', 'ETH'].includes(policy.asset)
        || policy.id !== `${policy.asset}-P0` || !id(policy.version) || policy.state !== 'UNVALIDATED'
        || !Array.isArray(policy.families) || policy.families.length !== 3)
        throw new RangeError('Invalid active P0 policy');
    const families = new Set<string>(), ids = new Set<string>();
    for (const f of policy.families) {
        if (!f || Object.keys(f).length !== 3 || !TECHNICAL_FAMILIES.includes(f.family) || !id(f.id) || !id(f.version)
            || families.has(f.family) || ids.has(f.id))
            throw new RangeError('Invalid policy family identity');
        families.add(f.family);
        ids.add(f.id);
    }
}
/** Comparator for complete qualified evidence; ascending canonical ASCII ID is
 * the final total-order tie break. No floating point T or raw S is consulted. */
export function compareCandidates(a: SignalAssessment, b: SignalAssessment): number {
    if (a.scoreRounded === null || b.scoreRounded === null || a.scoreRaw === null || b.scoreRaw === null
        || a.T === null || b.T === null || a.R === null || b.R === null)
        throw new RangeError('Incomplete ranking evidence');
    return b.scoreRounded - a.scoreRounded || compare(deserialize(b.scoreRaw), deserialize(a.scoreRaw))
        || compare(deserialize(b.T), deserialize(a.T)) || b.R - a.R || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
export function evaluateSignalCandidates(candles5m: readonly Candle[], asOf: string, contextFeed: ContextFeed, activePolicy: ActivePolicy): SignalSelection {
    validatePolicy(activePolicy, candles5m.at(-1)?.asset);
    // C2 owns structural history validation and certified triggers, once per call.
    const technical = evaluateTechnicalStrategies(candles5m, asOf);
    const exact = exactTechnicalScores(candles5m, technical), context = contextC(contextFeed, activePolicy.asset, asOf);
    const fits = technical.map(t => regimeFit(t.confirmedRegime, t.family, t.volatility));
    const eligible = technical.map((t, i) => t.technicalEligible && fits[i]!.eligible && exact[i]!.T !== null);
    const agreements = agreement(technical.map((t, i) => ({ asset: t.asset, policyId: activePolicy.id, policyVersion: activePolicy.version,
        policyState: activePolicy.state, family: t.family, familyId: activePolicy.families.find(f => f.family === t.family)!.id,
        eligible: eligible[i]!, T: exact[i]!.T })));
    const assessments = Object.freeze(technical.map((t, i): SignalAssessment => {
        const family = activePolicy.families.find(f => f.family === t.family)!, e = exact[i]!, fit = fits[i]!, a = agreements[i]!;
        const score = eligible[i] && a.A !== null ? globalScore(e.T, fit.R, context.C, a.A) : null;
        const reasons = [...e.reasons, ...fit.reasons];
        if (!t.technicalEligible)
            reasons.push(`TECHNICAL:${t.reason}`);
        if (context.status !== 'VALID')
            reasons.push(`CONTEXT:${context.reason}`);
        if (score && !score.thresholdMet)
            reasons.push('BELOW_THRESHOLD');
        if (score?.thresholdMet)
            reasons.push('QUALIFIED');
        return Object.freeze({ ...e, id: JSON.stringify([t.asset, t.closeTime, activePolicy.id, activePolicy.version, family.id, family.version]),
            asset: t.asset, closeTime: t.closeTime, policyId: activePolicy.id, policyVersion: activePolicy.version,
            familyId: family.id, familyVersion: family.version, technicalEligible: t.technicalEligible, technicalReason: t.reason,
            TApproximate: t.T, R: fit.R, C: context.C, H: 0, A: a.A, agreementParticipant: a.participant,
            scoreRaw: score?.raw ?? null, scoreRounded: score?.rounded ?? null, qualified: score?.thresholdMet === true, reasons: Object.freeze(reasons) });
    }));
    const representative = assessments.filter(a => a.qualified).sort(compareCandidates)[0] ?? null;
    return Object.freeze({ asset: activePolicy.asset, asOf, policyId: activePolicy.id, policyVersion: activePolicy.version, context, assessments, representative,
        discarded: Object.freeze(assessments.filter(a => a !== representative).map(assessment => Object.freeze({ assessment,
            reason: assessment.qualified ? 'LOWER_RANKED' as const : 'NOT_QUALIFIED' as const }))) });
}

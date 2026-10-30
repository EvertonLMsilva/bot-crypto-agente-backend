import { Asset } from '../simulation/candle';
import { TechnicalAssessment, TechnicalFamily } from '../strategies';
export interface Fraction {
    readonly numerator: bigint;
    readonly denominator: bigint;
}
export interface SerializedFraction {
    readonly numerator: string;
    readonly denominator: string;
}
export interface FamilyPolicy {
    readonly family: TechnicalFamily;
    readonly id: string;
    readonly version: string;
}
export interface ActivePolicy {
    readonly id: string;
    readonly version: string;
    readonly asset: Asset;
    readonly state: 'UNVALIDATED';
    readonly families: readonly FamilyPolicy[];
}
export type ContextCategory = 'CRYPTO' | 'MACRO' | 'GEOPOLITICAL_REGULATORY';
export type ContextState = 'RUMOR' | 'CONFIRMED' | 'RETRACTED' | 'UNCERTAIN';
export interface ContextImpact {
    readonly direction: -1 | 0 | 1;
    readonly intensity: 10 | 20 | 30;
}
export interface ContextEvent {
    readonly eventId: string;
    readonly groupId: string;
    readonly revision: number;
    readonly previousEventId: string | null;
    readonly source: string;
    readonly publishedAt: string;
    readonly availableAt: string;
    readonly sequence: number;
    readonly category: ContextCategory;
    readonly state: ContextState;
    readonly impacts: Readonly<Partial<Record<Asset, ContextImpact>>>;
}
export interface ContextFeed {
    readonly status: 'VALID' | 'INVALID';
    readonly events: readonly ContextEvent[];
}
export interface ContextGroup {
    readonly groupId: string;
    readonly state: ContextState | 'EXPIRED';
    readonly eventIds: readonly string[];
    readonly anchorTime: string;
    readonly contribution: SerializedFraction;
    readonly rumorPenalty: 0 | 5;
}
export interface ContextResult {
    readonly status: 'VALID' | 'UNAVAILABLE';
    readonly C: SerializedFraction | null;
    readonly U: number;
    readonly groups: readonly ContextGroup[];
    readonly reason: string;
}
export interface ExactTechnicalResult {
    readonly family: TechnicalFamily;
    readonly G: 0 | 1;
    readonly F: SerializedFraction | null;
    readonly Q: SerializedFraction | null;
    readonly V: SerializedFraction | null;
    readonly T: SerializedFraction | null;
    readonly reasons: readonly string[];
}
export interface GlobalScore {
    readonly raw: SerializedFraction;
    readonly rounded: number;
    readonly thresholdMet: boolean;
}
export interface SignalAssessment extends ExactTechnicalResult {
    readonly id: string;
    readonly asset: Asset;
    readonly closeTime: string;
    readonly policyId: string;
    readonly policyVersion: string;
    readonly familyId: string;
    readonly familyVersion: string;
    readonly technicalEligible: boolean;
    readonly technicalReason: TechnicalAssessment['reason'];
    readonly TApproximate: number | null;
    readonly R: number | null;
    readonly C: SerializedFraction | null;
    readonly H: 0;
    readonly A: 50 | 100 | null;
    readonly agreementParticipant: boolean;
    readonly scoreRaw: SerializedFraction | null;
    readonly scoreRounded: number | null;
    readonly qualified: boolean;
}
export interface SignalSelection {
    readonly asset: Asset;
    readonly asOf: string;
    readonly policyId: string;
    readonly policyVersion: string;
    readonly context: ContextResult;
    readonly assessments: readonly SignalAssessment[];
    readonly representative: SignalAssessment | null;
    readonly discarded: readonly {
        readonly assessment: SignalAssessment;
        readonly reason: 'LOWER_RANKED' | 'NOT_QUALIFIED';
    }[];
}

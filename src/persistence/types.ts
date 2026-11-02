import { ExecutionCommand, ExecutionState } from '../operations';
import { BudgetSnapshot, BudgetState } from '../budget';
import { ClockSnapshot } from '../simulation/clock';
import { CoordinationResult, CoordinatorState } from '../coordination/types';
import { ActivePolicy, ContextFeed } from '../signals/types';
import { Asset, Candle } from '../simulation/candle';
import type { SeededProvider, FixtureProvider } from '../simulation/market-source';
interface RuntimeConfigurationBase {
  readonly simulationId: string; readonly startTime: string; readonly initialCapital: string;
  readonly policies: Readonly<Record<Asset,ActivePolicy>>;
  readonly context: { readonly id:string; readonly version:string; readonly feed:ContextFeed };
  readonly warmup: { readonly hourlyCandles:150 };
}
export interface SeededRuntimeConfiguration extends RuntimeConfigurationBase {readonly version:'1';readonly provider:SeededProvider}
export interface FixtureRuntimeConfiguration extends RuntimeConfigurationBase {readonly version:'2';readonly provider:FixtureProvider}
/** Input descriptor; the version/provider pairing is checked at the public validation boundary. */
export interface RuntimeConfiguration extends RuntimeConfigurationBase {readonly version:'1'|'2';readonly provider:SeededProvider|FixtureProvider}
export interface WarmupProgress {
  readonly BTC: { readonly closed5m:number; readonly completeHours:number; readonly ready:boolean };
  readonly ETH: { readonly closed5m:number; readonly completeHours:number; readonly ready:boolean };
  readonly ready:boolean;
}
interface RuntimeEvidenceBase {
  readonly simulationId:string; readonly configHash:string;
  readonly asOf:string; readonly phase:ExecutionState['phase']; readonly confirmedSteps:number;
  readonly historyHash:string; readonly coordinatorState:CoordinatorState;
}
export interface RuntimeEvidence1 extends RuntimeEvidenceBase {readonly version:'1'; readonly provider:{readonly id:string;readonly version:string}}
export interface RuntimeEvidence2 extends RuntimeEvidenceBase {readonly version:'2'; readonly provider:{readonly id:'fixture-market';readonly version:'1';readonly identity:string;readonly manifestHash:string}}
export type RuntimeEvidence=RuntimeEvidence1|RuntimeEvidence2;
interface RuntimeSnapshotBase {
  readonly mode:'PAUSED'; readonly authorizedAt:string|null;
  readonly history:Readonly<Record<Asset,readonly Candle[]>>; readonly warmup:WarmupProgress;
  readonly openings:readonly Readonly<{asset:Asset;asOf:string;price:string}>[];
}
export type RuntimeSnapshot=RuntimeSnapshotBase & ((RuntimeEvidence1 & {readonly configuration:SeededRuntimeConfiguration})|
  (RuntimeEvidence2 & {readonly configuration:FixtureRuntimeConfiguration;readonly exhausted:boolean}));
export const ENGINE_VERSION = 'D4-472bc0a5-D5-cancel-v1';
export interface GeneratorEvidence { readonly version: string; readonly seed: string; readonly confirmedSteps: number }
export interface Configuration {
  readonly runtime?: RuntimeConfiguration;
  readonly engineVersion: string; readonly coordinatorState: CoordinatorState;
  readonly clock: ClockSnapshot; readonly generator: GeneratorEvidence;
}
export interface GenesisInput { readonly simulationId: string; readonly operationId: string; readonly initial: BudgetSnapshot; readonly configuration: Configuration }
export interface OperationPayload {
  readonly command: ExecutionCommand;
  readonly evidence: { readonly coordinator: CoordinationResult | null; readonly clock: ClockSnapshot; readonly generator: GeneratorEvidence; readonly runtime?:RuntimeEvidence };
}
export interface OperationInput { readonly simulationId: string; readonly operationId: string; readonly expectedRevision: string; readonly payload: string }
export interface Cursor {
  readonly asOf: string; readonly phase: ExecutionState['phase']; readonly authorizedAt: string | null;
  readonly coordinatorState: CoordinatorState; readonly clock: ClockSnapshot; readonly generator: GeneratorEvidence;
}
export interface Receipt {
  readonly simulationId: string; readonly operationId: string; readonly revision: string;
  readonly seqStart: string; readonly seqEnd: string; readonly stateHash: string;
  readonly cursor: Cursor; readonly fillIds: readonly string[]; readonly reservationIds: readonly string[];
}
export interface Control {
  readonly status: BudgetState; readonly revision: string; readonly headSeq: string; readonly headHash: string;
  readonly stateHash: string; readonly cursor: Cursor; readonly reason: string;
}
export interface LoadedState { readonly state: ExecutionState; readonly control: Control; readonly runtime?:RuntimeSnapshot }
/** A committed revision, never a promise that this is still the latest head.
 * Old idempotent receipts retain their identity; snapshot is null when that
 * revision cannot be certified by the current full reconstruction. */
export interface CommitSnapshot {
  readonly simulationId:string; readonly revision:string; readonly receipt:Receipt;
  readonly disposition:'COMMITTED'|'REPLAY'; readonly snapshot:LoadedState|null;
}
export interface StoreOptions { readonly create?: boolean; readonly schemaVersion?:1|2; readonly busyTimeoutMs: number; readonly fault?: (point: string) => void }
export interface LedgerEvent {
  readonly seq: string; readonly eventId: string; readonly operationId: string; readonly ordinal: string;
  readonly kind: string; readonly asOf: string; readonly phase: string; readonly payload: string;
  readonly previousHash: string; readonly hash: string;
}
export interface Posting { readonly eventSeq: string; readonly ordinal: string; readonly account: string; readonly amount: string }

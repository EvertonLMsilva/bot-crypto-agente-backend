import { ExecutionCommand, ExecutionState } from '../operations';
import { BudgetSnapshot, BudgetState } from '../budget';
import { ClockSnapshot } from '../simulation/clock';
import { CoordinationResult, CoordinatorState } from '../coordination/types';
import { ActivePolicy, ContextFeed } from '../signals/types';
import { Asset, Candle } from '../simulation/candle';
export interface RuntimeConfiguration {
  readonly version: '1'; readonly simulationId: string; readonly startTime: string; readonly initialCapital: string;
  readonly provider: { readonly id: 'seeded-generator'; readonly version: '1'; readonly seed: string; readonly initialPrices: Readonly<Record<Asset,string>> };
  readonly policies: Readonly<Record<Asset,ActivePolicy>>;
  readonly context: { readonly id:string; readonly version:string; readonly feed:ContextFeed };
  readonly warmup: { readonly hourlyCandles:150 };
}
export interface WarmupProgress {
  readonly BTC: { readonly closed5m:number; readonly completeHours:number; readonly ready:boolean };
  readonly ETH: { readonly closed5m:number; readonly completeHours:number; readonly ready:boolean };
  readonly ready:boolean;
}
export interface RuntimeEvidence {
  readonly version:'1'; readonly simulationId:string; readonly configHash:string;
  readonly provider: {readonly id:string; readonly version:string};
  readonly asOf:string; readonly phase:ExecutionState['phase']; readonly confirmedSteps:number;
  readonly historyHash:string; readonly coordinatorState:CoordinatorState;
}
export interface RuntimeSnapshot extends RuntimeEvidence {
  readonly mode:'PAUSED'; readonly configuration:RuntimeConfiguration; readonly authorizedAt:string|null;
  readonly history:Readonly<Record<Asset,readonly Candle[]>>; readonly warmup:WarmupProgress;
  readonly openings:readonly Readonly<{asset:Asset;asOf:string;price:string}>[];
}
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
export interface StoreOptions { readonly create?: boolean; readonly busyTimeoutMs: number; readonly fault?: (point: string) => void }
export interface LedgerEvent {
  readonly seq: string; readonly eventId: string; readonly operationId: string; readonly ordinal: string;
  readonly kind: string; readonly asOf: string; readonly phase: string; readonly payload: string;
  readonly previousHash: string; readonly hash: string;
}
export interface Posting { readonly eventSeq: string; readonly ordinal: string; readonly account: string; readonly amount: string }

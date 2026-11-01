import { LoadedState, RuntimeConfiguration } from '../persistence';
import { AuthorizationResult } from '../budget';
import { CoordinationResult } from '../coordination';
import { DecisionEnvelope } from '../operations/types';
import { ExitRequest } from '../operations';
export type RuntimeMode='PAUSED'|'WARMING_UP'|'READY'|'RECOVERING'|'BLOCKED';
export interface OperationalSnapshot { readonly mode:RuntimeMode; readonly confirmed:LoadedState; readonly diagnostic:string|null }
export interface BoundaryAnalysis {
  readonly decisions:readonly DecisionEnvelope[];
  readonly exits:readonly ExitRequest[];
  readonly coordination:CoordinationResult;
  readonly authorization:AuthorizationResult;
}
export type OperationalConfiguration=RuntimeConfiguration;

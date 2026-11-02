import { canonical, hash, identifier, immutable, parseCanonical, requireBudget, revision, same, ZERO_HASH } from './ledger';
import { Cursor, GenesisInput, Receipt } from './types';
import { ExecutionState } from '../operations';
import type { Row } from './sqlite-store';

export interface CheckpointRef {
 readonly format:'REF1'; readonly kind:'GENESIS'|'CLOSE'; readonly simulationId:string; readonly operationId:string;
 readonly checkpointIndex:string; readonly revision:string; readonly eventSeq:string; readonly genesisHash:string;
 readonly prefixHash:string; readonly stateHash:string; readonly cursorHash:string; readonly receiptHash:string;
 readonly previousRefHash:string; readonly hash:string;
}
const columns={simulationId:'simulation_id',operationId:'operation_id',checkpointIndex:'checkpoint_index',revision:'revision',eventSeq:'event_seq',format:'format',kind:'kind',
 genesisHash:'genesis_hash',prefixHash:'prefix_hash',stateHash:'state_hash',cursorHash:'cursor_hash',receiptHash:'receipt_hash',previousRefHash:'previous_ref_hash',hash:'hash'} as const;
const keys=Object.keys(columns).sort();
function validate(value:unknown):asserts value is CheckpointRef {
 requireBudget(value!==null && typeof value==='object' && !Array.isArray(value) && same(Object.keys(value).sort(),keys),'REF1 requires exactly 14 fields');
 const r=value as CheckpointRef;requireBudget(Object.values(r).every(v=>typeof v==='string'),'REF1 fields must be strings');
 requireBudget(r.format==='REF1' && (r.kind==='GENESIS'||r.kind==='CLOSE'),'Unsupported REF1 format/kind');
 identifier(r.simulationId);identifier(r.operationId);revision(r.checkpointIndex);revision(r.revision);requireBudget(revision(r.eventSeq)>0n,'REF1 eventSeq must be positive');
 for(const k of ['genesisHash','prefixHash','stateHash','cursorHash','receiptHash','previousRefHash','hash'] as const)requireBudget(/^[0-9a-f]{64}$/.test(r[k]),'Invalid REF1 hash representation');
 requireBudget(r.kind==='GENESIS'?r.checkpointIndex==='0' && r.revision==='0' && r.previousRefHash===ZERO_HASH:BigInt(r.checkpointIndex)>0n && BigInt(r.revision)>0n,'Invalid REF1 GENESIS/CLOSE linkage');
}
function ownHash(r:CheckpointRef):string {const {hash:excluded,...reference}=r;return hash({domain:'BOT-CRYPTO:CHECKPOINT:REF1',reference});}
/** Strict UTF8/canonical wire decoder; SQL integer coercions are never wire validation. */
export function parseCheckpointRef(input:string|Uint8Array):CheckpointRef {
 requireBudget(typeof input==='string' || input instanceof Uint8Array,'REF1 requires canonical text or UTF8 bytes');
 const text=typeof input==='string'?input:new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(input);
 const r=parseCanonical<unknown>(text);validate(r);requireBudget(r.hash===ownHash(r),'REF1 hash mismatch');return immutable(r);
}
export function createCheckpointRef(g:GenesisInput,r:Receipt,state:ExecutionState,cursor:Cursor,prefixHash:string,checkpointIndex:string,previousRefHash:string):CheckpointRef {
 requireBudget(r.simulationId===g.simulationId && r.stateHash===hash(state) && same(r.cursor,cursor),'REF1 financial receipt mismatch');
 const ref:CheckpointRef={format:'REF1',kind:r.revision==='0'?'GENESIS':'CLOSE',simulationId:r.simulationId,operationId:r.operationId,checkpointIndex,revision:r.revision,
 eventSeq:r.seqEnd,genesisHash:hash(g),prefixHash,stateHash:r.stateHash,cursorHash:hash(cursor),receiptHash:hash(r),previousRefHash,hash:ZERO_HASH};
 validate(ref);return immutable({...ref,hash:ownHash(ref)});
}
export function checkpointRefRow(r:CheckpointRef):Row {return Object.fromEntries(Object.entries(columns).map(([key,column])=>[column,r[key as keyof CheckpointRef]]));}
export function parseCheckpointRefRow(row:Row):CheckpointRef {
 requireBudget(same(Object.keys(row).sort(),Object.values(columns).sort()),'REF1 SQL columns mismatch');
 return parseCheckpointRef(canonical(Object.fromEntries(Object.entries(columns).map(([key,column])=>[key,row[column]]))));
}
export function checkpointRefValues(r:CheckpointRef):(string|bigint)[] {
 const row=checkpointRefRow(r);return Object.values(columns).map(c=>['checkpoint_index','revision','event_seq'].includes(c)?BigInt(row[c]!):row[c]!);
}

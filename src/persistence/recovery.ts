import { SqliteStore, Row } from './sqlite-store';
import { CheckpointRef, createCheckpointRef, parseCheckpointRefRow, checkpointRefRow } from './checkpoint-ref';
import { Control, Cursor, GenesisInput, LedgerEvent, OperationPayload, Posting, Receipt, RuntimeSnapshot } from './types';
import { createRuntimeReplay } from './runtime-evidence';
import { advanceCursor, buildLedger, canonical, genesisState, hash, immutable, parseCanonical, requireBudget, same, ZERO_HASH } from './ledger';
import { ExecutionState } from '../operations';
import { createExecutionReplay } from '../operations/execution';
export function eventRow(sim:string,e:LedgerEvent):Row{return {simulation_id:sim,seq:e.seq,event_id:e.eventId,operation_id:e.operationId,ordinal:e.ordinal,kind:e.kind,
  as_of:e.asOf,phase:e.phase,payload:e.payload,previous_hash:e.previousHash,hash:e.hash,schema_version:'1'};}
export function postingRow(sim:string,p:Posting):Row{return {simulation_id:sim,event_seq:p.eventSeq,ordinal:p.ordinal,account:p.account,amount:p.amount};}
export function checkpointRow(sim:string,r:Receipt,s:ExecutionState,headHash:string):Row{return {simulation_id:sim,event_seq:r.seqEnd,revision:r.revision,prefix_hash:headHash,
  state:canonical(s),state_hash:r.stateHash,cursor:canonical(r.cursor),schema_version:'1'};}
export function appendControl(store:SqliteStore,simulationId:string,control:Control):void {
  const old=store.all('SELECT * FROM runtime_control WHERE simulation_id=? ORDER BY control_seq DESC LIMIT 1',[simulationId])[0];
  const seq=old?String(BigInt(old.control_seq!)+1n):'1',previousHash=old?.hash??ZERO_HASH,payload=canonical(control);
  store.run('INSERT INTO runtime_control VALUES(?,?,?,?,?)',[simulationId,BigInt(seq),payload,previousHash,hash({simulationId,seq,payload,previousHash})]);
}
export function controls(store:SqliteStore,simulationId:string):Control[] {
  const rows=store.all('SELECT * FROM runtime_control WHERE simulation_id=? ORDER BY control_seq',[simulationId]);
  requireBudget(rows.length>0,'Missing persistent runtime control');let previousHash=ZERO_HASH;
  return rows.map((row,i)=>{
    requireBudget(row.control_seq===String(i+1) && row.previous_hash===previousHash
      && row.hash===hash({simulationId,seq:row.control_seq,payload:row.payload,previousHash}),'Corrupted runtime control history');
    const c=parseCanonical<Control>(row.payload!);
    requireBudget(['RUNNING','RECOVERING','ENTRY_SUSPENDED','MANUAL_REVIEW_REQUIRED'].includes(c.status),'Invalid persistent runtime status');
    previousHash=row.hash!;return c;
  });
}
export interface Confirmed {
  readonly genesis:GenesisInput;readonly runtime?:RuntimeSnapshot;
  readonly state:ExecutionState;readonly cursor:Cursor;readonly revision:string;readonly headSeq:string;readonly headHash:string;
  readonly checkpointIssue:boolean;readonly control:Control;readonly checkpointRef?:CheckpointRef;
}
export function reconstruct(store:SqliteStore,simulationId:string):Confirmed {
  return store.withReplay(checkActive=>{
  requireBudget(store.get('PRAGMA integrity_check').integrity_check==='ok','SQLite integrity/references failed');
  const foreignIssues=store.all('PRAGMA foreign_key_check');
  requireBudget(foreignIssues.every(row=>store.schemaVersion===2 && ['checkpoint_refs','checkpoints'].includes(row.table!)),'SQLite integrity/references failed');
  const simulation=store.get('SELECT * FROM simulations WHERE id=?',[simulationId]);
  requireBudget(hash(parseCanonical(simulation.genesis!))===simulation.genesis_hash,'Corrupted genesis');
  const genesis=parseCanonical<GenesisInput>(simulation.genesis!);requireBudget(genesis.simulationId===simulationId,'Genesis identity mismatch');
  let {state,cursor}=genesisState(genesis),headSeq='0',headHash=ZERO_HASH,rev='0';
  const financial=createExecutionReplay(genesis.initial,checkActive);
  let market:ReturnType<typeof createRuntimeReplay>|undefined,checkpoints:IterableIterator<Row>|undefined;
  try{
  market=createRuntimeReplay(genesis,checkActive);
  checkpoints=store.iterate(store.schemaVersion===1?'SELECT * FROM checkpoints WHERE simulation_id=? ORDER BY event_seq':'SELECT * FROM checkpoint_refs WHERE simulation_id=? ORDER BY checkpoint_index',[simulationId]);
  let checkpointIssue=foreignIssues.length>0 || store.schemaVersion===2 && store.get('SELECT count(*) n FROM checkpoints WHERE simulation_id=?',[simulationId]).n!=='0';
  let checkpointRef:CheckpointRef|undefined;
  const operations=store.all('SELECT * FROM operations WHERE simulation_id=? ORDER BY revision',[simulationId]);
  requireBudget(operations.length>0,'Missing confirmed genesis operation');
  const events:Row[]=[],postings:Row[]=[],receipts=new Map<string,{r:Receipt;h:string}>();
  for(const [i,op] of operations.entries()){
    requireBudget(op.revision===String(i) && op.payload_hash===hash(parseCanonical(op.payload!)),'Operation revision/payload corruption');
    let before:ExecutionState|null=null,p:OperationPayload|null=null;
    if(i===0)requireBudget(op.operation_id===genesis.operationId && op.command_id==='GENESIS' && op.payload===simulation.genesis,'Invalid genesis operation');
    else{
      before=state;p=parseCanonical<OperationPayload>(op.payload!);
      requireBudget(p.command.id===op.command_id,'Operation/command identity mismatch');
      state=financial.append(p.command);cursor=advanceCursor(cursor,p,state);
      market.append(p,state,cursor);
    }
    const built=buildLedger(simulationId,op.operation_id!,String(i),before,state,cursor,headSeq,headHash,i===0?genesis:undefined);
    requireBudget(canonical(built.receipt)===op.receipt,'Confirmed receipt differs from replay');
    events.push(...built.events.map(e=>eventRow(simulationId,e)));postings.push(...built.postings.map(p=>postingRow(simulationId,p)));
    headSeq=built.receipt.seqEnd;headHash=built.events.at(-1)!.hash;rev=String(i);receipts.set(rev,{r:built.receipt,h:headHash});
    if(i===0 || p?.command.kind==='CLOSE'){
      const row=checkpoints.next();
      if(store.schemaVersion===1){if(row.done || !same(checkpointRow(simulationId,built.receipt,state,headHash),row.value))checkpointIssue=true;}
      else{
        // Always derive the predecessor from verified history, even after a bad stored reference.
        checkpointRef=createCheckpointRef(genesis,built.receipt,state,cursor,headHash,checkpointRef?String(BigInt(checkpointRef.checkpointIndex)+1n):'0',checkpointRef?.hash??ZERO_HASH);
        try{if(row.done || !same(parseCheckpointRefRow(row.value),checkpointRef) || !same(row.value,checkpointRefRow(checkpointRef)))checkpointIssue=true;}
        catch{checkpointIssue=true;}
      }
    }
  }
  while(!checkpoints.next().done)checkpointIssue=true;
  requireBudget(same(events,store.all('SELECT * FROM events WHERE simulation_id=? ORDER BY seq',[simulationId])),'Missing, duplicated, reordered or corrupted ledger event');
  requireBudget(same(postings,store.all('SELECT * FROM postings WHERE simulation_id=? ORDER BY event_seq,ordinal',[simulationId])),'Inconsistent financial postings');
  const history=controls(store,simulationId);
  for(const c of history){const pair=receipts.get(c.revision);requireBudget(pair && c.headSeq===pair.r.seqEnd && c.headHash===pair.h
    && c.stateHash===pair.r.stateHash && same(c.cursor,pair.r.cursor),'Runtime head/cursor differs from confirmed history');}
  const control=history.at(-1)!;requireBudget(control.revision===rev && control.headHash===headHash,'Unconfirmed/obsolete runtime head');
  const runtime=market.snapshot(state,cursor);
  return immutable({genesis,state,cursor,revision:rev,headSeq,headHash,control,...(runtime?{runtime}:{}),
    checkpointIssue,...(checkpointRef?{checkpointRef}:{})});
  }finally{try{checkpoints?.return?.();}finally{market?.close();financial.close();}}
  });
}

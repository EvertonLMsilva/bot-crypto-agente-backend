import { SqliteStore } from './sqlite-store';
import { CheckpointRef, createCheckpointRef, checkpointRefRow, checkpointRefValues } from './checkpoint-ref';
import { appendControl, checkpointRow, Confirmed, controls, eventRow, postingRow, reconstruct } from './recovery';
import { advanceCursor, buildLedger, canonical, execute, genesisState, hash, identifier, immutable, parseCanonical, requireBudget, revision, same, ZERO_HASH } from './ledger';
import { CommitSnapshot, Control, GenesisInput, LoadedState, OperationInput, OperationPayload, Receipt, RuntimeSnapshot, StoreOptions } from './types';
import { validateRuntimeOperation } from './runtime-evidence';
class IntegrityFailure extends RangeError {}
class CheckpointFailure extends RangeError {}
/** Durable boundary only. All execution prices, fills and protections remain D4. */
export class DurableExecution {
  private readonly store:SqliteStore;
  private readonly blocked=new Set<string>();
  constructor(path:string,private readonly options:StoreOptions){
    this.store=new SqliteStore(path,options);
    for(const row of this.store.all('SELECT id FROM simulations')){
      const id=row.id!;
      try{this.store.transaction(()=>{const prior=controls(this.store,id).at(-1)!;appendControl(this.store,id,{...prior,status:'RECOVERING',reason:'PROCESS_OPEN'});});}
      catch(e){this.block(id,e);}
    }
  }
  private checked(id:string):Confirmed {
    try{return reconstruct(this.store,id);}catch(e){throw new IntegrityFailure(String(e));}
  }
  private block(id:string,error:unknown):void {
    this.blocked.add(id);
    try{this.store.transaction(()=>{
      const row=this.store.get('SELECT payload FROM runtime_control WHERE simulation_id=? ORDER BY control_seq DESC LIMIT 1',[id]);
      const prior=parseCanonical<Control>(row.payload!);
      appendControl(this.store,id,{...prior,status:'MANUAL_REVIEW_REQUIRED',reason:`INTEGRITY_FAILURE:${String(error)}`});
    });}catch{/* An unwritable/corrupt store cannot certify a persisted block. Local block remains. */}
  }
  private guarded<T>(id:string,fn:()=>T):T {
    identifier(id);requireBudget(!this.blocked.has(id),'MANUAL_REVIEW_REQUIRED: process locally blocked');
    try{return this.store.transaction(fn);}catch(e){
      if(e instanceof CheckpointFailure){
        try{this.store.transaction(()=>{const c=this.checked(id);appendControl(this.store,id,{...c.control,status:'ENTRY_SUSPENDED',reason:'CHECKPOINT_MISMATCH_LEDGER_VALID'});});}
        catch(failure){this.block(id,failure);}
      }else if(e instanceof IntegrityFailure || !(e instanceof RangeError))this.block(id,e);
      throw e;
    }
  }
  private save(id:string,operationId:string,commandId:string,payload:string,built:ReturnType<typeof buildLedger>,state:LoadedState['state'],checkpoint:boolean,origin?:GenesisInput,previous?:CheckpointRef):CheckpointRef|undefined {
    const r=built.receipt;
    this.store.run('INSERT INTO operations VALUES(?,?,?,?,?,?,?)',[id,operationId,BigInt(r.revision),commandId,payload,hash(parseCanonical(payload)),canonical(r)]);
    this.options.fault?.('after-operation');
    for(const e of built.events)this.store.run('INSERT INTO events VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
      [id,BigInt(e.seq),e.eventId,operationId,BigInt(e.ordinal),e.kind,e.asOf,e.phase,e.payload,e.previousHash,e.hash,1]);
    this.options.fault?.('after-events');
    for(const p of built.postings)this.store.run('INSERT INTO postings VALUES(?,?,?,?,?)',[id,BigInt(p.eventSeq),BigInt(p.ordinal),p.account,p.amount]);
    this.options.fault?.('after-postings');
    if(checkpoint){
      if(this.store.schemaVersion===1){const cp=checkpointRow(id,r,state,built.events.at(-1)!.hash);this.store.run('INSERT INTO checkpoints VALUES(?,?,?,?,?,?,?,?)',
        [id,BigInt(cp.event_seq!),BigInt(cp.revision!),cp.prefix_hash!,cp.state!,cp.state_hash!,cp.cursor!,1]);}
      else{
        requireBudget(origin,'REF1 requires verified genesis');
        const ref=createCheckpointRef(origin,r,state,r.cursor,built.events.at(-1)!.hash,previous?String(BigInt(previous.checkpointIndex)+1n):'0',previous?.hash??ZERO_HASH);
        this.store.run('INSERT INTO checkpoint_refs VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',checkpointRefValues(ref));return ref;
      }
    }
  }
  createSimulation(input:GenesisInput):Receipt {
    const g=immutable(input),{state,cursor}=genesisState(g),id=g.simulationId,payload=canonical(g);
    return this.guarded(id,()=>{
      const existing=this.store.all('SELECT genesis FROM simulations WHERE id=?',[id])[0];
      if(existing){requireBudget(existing.genesis===payload,'Divergent simulation genesis');this.checked(id);
        return immutable(parseCanonical<Receipt>(this.store.get('SELECT receipt FROM operations WHERE simulation_id=? AND revision=0',[id]).receipt!));}
      this.store.run('INSERT INTO simulations VALUES(?,?,?)',[id,payload,hash(g)]);
      const built=buildLedger(id,g.operationId,'0',null,state,cursor,'0',ZERO_HASH,g);
      // Genesis is an explicit operation, not an implicit default on opening a file.
      this.save(id,g.operationId,'GENESIS',payload,built,state,true,g);
      appendControl(this.store,id,{status:'RUNNING',revision:'0',headSeq:built.receipt.seqEnd,headHash:built.events.at(-1)!.hash,
        stateHash:built.receipt.stateHash,cursor,reason:'EXPLICIT_GENESIS_VALIDATED'});
      if(this.store.schemaVersion===2 && this.checked(id).checkpointIssue)throw new IntegrityFailure('COMMIT_REF1: genesis checkpoint mismatch');
      return immutable(built.receipt);
    });
  }
  commitOperation(input:OperationInput):Receipt {return this.commitOperationWithSnapshot(input).receipt;}
  /** Prepare under the writer lock, publish only once transaction() commits.
   * No financial snapshot is accepted as proof for a subsequent transaction. */
  commitOperationWithSnapshot(input:OperationInput):CommitSnapshot {
    identifier(input.operationId);revision(input.expectedRevision);
    const p=parseCanonical<OperationPayload>(input.payload),id=input.simulationId;
    const result=this.guarded<CommitSnapshot>(id,()=>{
      const existing=this.store.all('SELECT * FROM operations WHERE simulation_id=? AND operation_id=?',[id,input.operationId])[0];
      const confirmed=this.checked(id);
      if(existing){
        requireBudget(existing.payload===input.payload,'Divergent payload for durable operation identity');
        const receipt=parseCanonical<Receipt>(existing.receipt!);
        const snapshot=receipt.revision===confirmed.revision && !confirmed.checkpointIssue
          ?{state:confirmed.state,control:confirmed.control,...(confirmed.runtime?{runtime:confirmed.runtime}:{})}:null;
        return immutable({simulationId:id,revision:receipt.revision,receipt,disposition:'REPLAY',snapshot});
      }
      requireBudget(confirmed.revision===input.expectedRevision,'CONFLICT: obsolete expected revision');
      const status=confirmed.control.status;
      if(confirmed.checkpointIssue && status==='RUNNING')throw new CheckpointFailure('ENTRY_SUSPENDED: checkpoint differs from confirmed ledger');
      requireBudget(!confirmed.checkpointIssue && status==='RUNNING' || status==='ENTRY_SUSPENDED','Recovery/integrity gate blocks operation');
      requireBudget(p.command && !this.store.all('SELECT command_id FROM operations WHERE simulation_id=? AND command_id=?',[id,p.command.id]).length,'D4 command already durably processed');
      if(status==='ENTRY_SUSPENDED'){
        requireBudget(p.command.kind!=='AUTHORIZE' || p.command.authorization.decisions.every(d=>d.status==='REJECTED'),'New entry authorization suspended');
        requireBudget(p.command.kind!=='OPEN' || !confirmed.state.reservations.some(r=>r.status==='ACTIVE'),'Cancel active entry holds before processing suspended opening');
      }
      let state:LoadedState['state'],cursor:Control['cursor'],runtime:RuntimeSnapshot|undefined;
      try{
        state=execute(confirmed.state,p);cursor=advanceCursor(confirmed.cursor,p,state);
        runtime=validateRuntimeOperation(confirmed.genesis,state,p,cursor);
      }catch(e){
        if(Object.hasOwn(confirmed.genesis.configuration,'runtime') || p.evidence && Object.hasOwn(p.evidence,'runtime'))throw new IntegrityFailure(`RUNTIME_EVIDENCE:${String(e)}`);
        throw e;
      }
      const rev=String(BigInt(confirmed.revision)+1n);
      const built=buildLedger(id,input.operationId,rev,confirmed.state,state,cursor,confirmed.headSeq,confirmed.headHash);
      const ref=this.save(id,input.operationId,p.command.id,input.payload,built,state,p.command.kind==='CLOSE',confirmed.genesis,confirmed.checkpointRef);
      const control:Control={status,revision:rev,headSeq:built.receipt.seqEnd,headHash:built.events.at(-1)!.hash,stateHash:built.receipt.stateHash,cursor,reason:'OPERATION_CONFIRMED'};
      appendControl(this.store,id,control);
      // Check actual rows, not just the values offered to SQLite. Historical
      // rows were independently replayed above under this same writer lock.
      try{
        requireBudget(same(this.store.get('SELECT * FROM operations WHERE simulation_id=? AND operation_id=?',[id,input.operationId]),
          {simulation_id:id,operation_id:input.operationId,revision:rev,command_id:p.command.id,payload:input.payload,payload_hash:hash(p),receipt:canonical(built.receipt)}),'Persisted operation differs');
        requireBudget(same(this.store.all('SELECT * FROM events WHERE simulation_id=? AND seq>=? ORDER BY seq',[id,BigInt(built.receipt.seqStart)]),
          built.events.map(e=>eventRow(id,e))),'Persisted events differ');
        requireBudget(same(this.store.all('SELECT * FROM postings WHERE simulation_id=? AND event_seq>=? ORDER BY event_seq,ordinal',[id,BigInt(built.receipt.seqStart)]),
          built.postings.map(p=>postingRow(id,p))),'Persisted postings differ');
        if(this.store.schemaVersion===1){
          if(p.command.kind==='CLOSE')requireBudget(same(this.store.get('SELECT * FROM checkpoints WHERE simulation_id=? AND revision=?',[id,BigInt(rev)]),
            checkpointRow(id,built.receipt,state,control.headHash)),'Persisted checkpoint differs');
        }else{
          const from=ref?.checkpointIndex??String(BigInt(confirmed.checkpointRef!.checkpointIndex)+1n);
          requireBudget(same(this.store.all('SELECT * FROM checkpoint_refs WHERE simulation_id=? AND checkpoint_index>=? ORDER BY checkpoint_index',[id,BigInt(from)]),ref?[checkpointRefRow(ref)]:[]),'Persisted REF1 differs');
          requireBudget(this.store.get('SELECT count(*) n FROM checkpoints WHERE simulation_id=?',[id]).n==='0','Mixed checkpoint formats');
        }
        requireBudget(same(controls(this.store,id).at(-1),control),'Persisted control differs');
      }catch(e){throw new IntegrityFailure(`COMMIT_SNAPSHOT:${String(e)}`);}
      const prepared=immutable({simulationId:id,revision:rev,receipt:built.receipt,disposition:'COMMITTED' as const,
        snapshot:{state,control,...(runtime?{runtime}:{})}});
      this.options.fault?.('before-commit');return prepared;
    });
    this.options.fault?.('after-commit');return result;
  }
  loadState(id:string):LoadedState {
    return this.guarded(id,()=>{
      const c=this.checked(id);let control=c.control;
      if(c.checkpointIssue && control.status==='RUNNING'){
        control={...control,status:'ENTRY_SUSPENDED',reason:'CHECKPOINT_MISMATCH_LEDGER_VALID'};appendControl(this.store,id,control);
      }
      return immutable({state:c.state,control,...(c.runtime?{runtime:c.runtime}:{})});
    });
  }
  recover(id:string,resumeEntries=false):LoadedState {
    identifier(id);
    try{
      this.store.transaction(()=>{const prior=controls(this.store,id).at(-1)!;appendControl(this.store,id,{...prior,status:'RECOVERING',reason:'RECOVERY_STARTED'});});
      const result=this.store.transaction(()=>{
        const c=this.checked(id),history=controls(this.store,id),prior=history.filter(v=>v.status!=='RECOVERING').at(-1)!;
        const suspended=c.checkpointIssue || prior.status==='ENTRY_SUSPENDED' && !resumeEntries;
        const control:Control={...c.control,status:suspended?'ENTRY_SUSPENDED':'RUNNING',reason:c.checkpointIssue?'CHECKPOINT_MISMATCH_LEDGER_VALID':'REPLAY_AND_RECONCILIATION_VALIDATED'};
        appendControl(this.store,id,control);return immutable({state:c.state,control,...(c.runtime?{runtime:c.runtime}:{})});
      });
      this.blocked.delete(id);return result;
    }catch(e){this.block(id,e);throw e;}
  }
  suspendEntries(id:string,reason:string):LoadedState {
    requireBudget(typeof reason==='string' && reason.length>0,'Explicit suspension reason required');
    return this.guarded(id,()=>{const c=this.checked(id);const control:Control={...c.control,status:'ENTRY_SUSPENDED',reason};
      appendControl(this.store,id,control);return immutable({state:c.state,control,...(c.runtime?{runtime:c.runtime}:{})});});
  }
  close():void {this.store.close();}
}

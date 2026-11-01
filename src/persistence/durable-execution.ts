import { SqliteStore } from './sqlite-store';
import { appendControl, checkpointRow, Confirmed, controls, eventRow, postingRow, reconstruct } from './recovery';
import { advanceCursor, buildLedger, canonical, execute, genesisState, hash, identifier, immutable, parseCanonical, requireBudget, revision, ZERO_HASH } from './ledger';
import { Control, GenesisInput, LoadedState, OperationInput, OperationPayload, Receipt, StoreOptions } from './types';
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
  private save(id:string,operationId:string,commandId:string,payload:string,built:ReturnType<typeof buildLedger>,state:LoadedState['state'],checkpoint:boolean):void {
    const r=built.receipt;
    this.store.run('INSERT INTO operations VALUES(?,?,?,?,?,?,?)',[id,operationId,BigInt(r.revision),commandId,payload,hash(parseCanonical(payload)),canonical(r)]);
    this.options.fault?.('after-operation');
    for(const e of built.events)this.store.run('INSERT INTO events VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
      [id,BigInt(e.seq),e.eventId,operationId,BigInt(e.ordinal),e.kind,e.asOf,e.phase,e.payload,e.previousHash,e.hash,1]);
    this.options.fault?.('after-events');
    for(const p of built.postings)this.store.run('INSERT INTO postings VALUES(?,?,?,?,?)',[id,BigInt(p.eventSeq),BigInt(p.ordinal),p.account,p.amount]);
    this.options.fault?.('after-postings');
    if(checkpoint){const cp=checkpointRow(id,r,state,built.events.at(-1)!.hash);this.store.run('INSERT INTO checkpoints VALUES(?,?,?,?,?,?,?,?)',
      [id,BigInt(cp.event_seq!),BigInt(cp.revision!),cp.prefix_hash!,cp.state!,cp.state_hash!,cp.cursor!,1]);}
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
      this.save(id,g.operationId,'GENESIS',payload,built,state,true);
      appendControl(this.store,id,{status:'RUNNING',revision:'0',headSeq:built.receipt.seqEnd,headHash:built.events.at(-1)!.hash,
        stateHash:built.receipt.stateHash,cursor,reason:'EXPLICIT_GENESIS_VALIDATED'});
      return immutable(built.receipt);
    });
  }
  commitOperation(input:OperationInput):Receipt {
    identifier(input.operationId);revision(input.expectedRevision);
    const p=parseCanonical<OperationPayload>(input.payload),id=input.simulationId;
    const receipt=this.guarded(id,()=>{
      const existing=this.store.all('SELECT * FROM operations WHERE simulation_id=? AND operation_id=?',[id,input.operationId])[0];
      const confirmed=this.checked(id);
      if(existing){requireBudget(existing.payload===input.payload,'Divergent payload for durable operation identity');return immutable(parseCanonical<Receipt>(existing.receipt!));}
      requireBudget(confirmed.revision===input.expectedRevision,'CONFLICT: obsolete expected revision');
      const status=confirmed.control.status;
      if(confirmed.checkpointIssue && status==='RUNNING')throw new CheckpointFailure('ENTRY_SUSPENDED: checkpoint differs from confirmed ledger');
      requireBudget(!confirmed.checkpointIssue && status==='RUNNING' || status==='ENTRY_SUSPENDED','Recovery/integrity gate blocks operation');
      requireBudget(p.command && !this.store.all('SELECT command_id FROM operations WHERE simulation_id=? AND command_id=?',[id,p.command.id]).length,'D4 command already durably processed');
      if(status==='ENTRY_SUSPENDED'){
        requireBudget(p.command.kind!=='AUTHORIZE' || p.command.authorization.decisions.every(d=>d.status==='REJECTED'),'New entry authorization suspended');
        requireBudget(p.command.kind!=='OPEN' || !confirmed.state.reservations.some(r=>r.status==='ACTIVE'),'Cancel active entry holds before processing suspended opening');
      }
      const state=execute(confirmed.state,p),cursor=advanceCursor(confirmed.cursor,p,state),rev=String(BigInt(confirmed.revision)+1n);
      const built=buildLedger(id,input.operationId,rev,confirmed.state,state,cursor,confirmed.headSeq,confirmed.headHash);
      this.save(id,input.operationId,p.command.id,input.payload,built,state,p.command.kind==='CLOSE');
      appendControl(this.store,id,{status,revision:rev,headSeq:built.receipt.seqEnd,headHash:built.events.at(-1)!.hash,stateHash:built.receipt.stateHash,cursor,reason:'OPERATION_CONFIRMED'});
      this.options.fault?.('before-commit');return immutable(built.receipt);
    });
    this.options.fault?.('after-commit');return receipt;
  }
  loadState(id:string):LoadedState {
    return this.guarded(id,()=>{
      const c=this.checked(id);let control=c.control;
      if(c.checkpointIssue && control.status==='RUNNING'){
        control={...control,status:'ENTRY_SUSPENDED',reason:'CHECKPOINT_MISMATCH_LEDGER_VALID'};appendControl(this.store,id,control);
      }
      return immutable({state:c.state,control});
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
        appendControl(this.store,id,control);return immutable({state:c.state,control});
      });
      this.blocked.delete(id);return result;
    }catch(e){this.block(id,e);throw e;}
  }
  suspendEntries(id:string,reason:string):LoadedState {
    requireBudget(typeof reason==='string' && reason.length>0,'Explicit suspension reason required');
    return this.guarded(id,()=>{const c=this.checked(id);const control:Control={...c.control,status:'ENTRY_SUSPENDED',reason};
      appendControl(this.store,id,control);return immutable({state:c.state,control});});
  }
  close():void {this.store.close();}
}

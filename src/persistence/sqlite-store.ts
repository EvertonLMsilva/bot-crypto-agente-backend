import { DatabaseSync, SQLInputValue } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { migrate } from './schema';
import { StoreOptions } from './types';
export type Row = Record<string,string>;
/** One local file; every balance-changing call acquires SQLite's writer lock. */
export class SqliteStore {
  readonly db: DatabaseSync;
  private closed = false;
  #transaction:object|null=null;
  constructor(readonly path: string, readonly options: StoreOptions) {
    if (!isAbsolute(path) || (!existsSync(path) && options.create !== true)
      || !Number.isInteger(options.busyTimeoutMs) || options.busyTimeoutMs < 0 || options.busyTimeoutMs > 5000) throw new RangeError('Explicit local database path/create/timeout required');
    this.db = new DatabaseSync(path,{enableForeignKeyConstraints:true,allowExtension:false});
    try {
      this.db.enableLoadExtension(false);
      this.db.exec(`PRAGMA busy_timeout=${options.busyTimeoutMs}; PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;`);
      if (this.db.prepare('PRAGMA journal_mode').get()!.journal_mode !== 'wal'
        || this.db.prepare('PRAGMA synchronous').get()!.synchronous !== 2
        || this.db.prepare('PRAGMA foreign_keys').get()!.foreign_keys !== 1) throw new RangeError('Required SQLite pragmas unavailable');
      migrate(this.db);
    } catch(e) { this.db.close();this.closed=true;throw e; }
  }
  all(sql: string, args: readonly SQLInputValue[] = []): Row[] {
    const statement = this.db.prepare(sql); statement.setReadBigInts(true);
    return statement.all(...args).map(row => Object.fromEntries(Object.entries(row).map(([k,v])=>[k,String(v)])));
  }
  get(sql: string, args: readonly SQLInputValue[] = []): Row {
    const row = this.all(sql,args)[0]; if (!row) throw new RangeError('Missing confirmed database record'); return row;
  }
  run(sql: string, args: readonly SQLInputValue[] = []): void { this.db.prepare(sql).run(...args); }
  /** Scope is revoked even when the callback throws; it cannot cross transactions. */
  withReplay<T>(fn:(checkActive:()=>void)=>T):T {
    const transaction=this.#transaction;let active=true;
    const check=()=>{if(!active || !transaction || transaction!==this.#transaction || !this.db.isTransaction)throw new RangeError('Replay scope is not active');};
    check();try{return fn(check);}finally{active=false;}
  }
  iterate(sql:string,args:readonly SQLInputValue[]=[]):IterableIterator<Row> {
    const transaction=this.#transaction,db=this.db,store=this;
    const check=()=>{if(!transaction || transaction!==store.#transaction || !db.isTransaction)throw new RangeError('SQL iterator outside its transaction');};
    check();
    return (function*(){
      check();const statement=db.prepare(sql);statement.setReadBigInts(true);const iterator=statement.iterate(...args);
      try{while(true){check();const next=iterator.next();if(next.done)return;
        yield Object.fromEntries(Object.entries(next.value).map(([k,v])=>[k,String(v)]));
      }}finally{iterator.return?.();}
    })();
  }
  transaction<T>(f:()=>T): T {
    this.db.exec('BEGIN IMMEDIATE');
    this.#transaction={};
    try {const result=f();this.db.exec('COMMIT');return result;}
    catch(e){if(this.db.isTransaction)this.db.exec('ROLLBACK');throw e;}
    finally{this.#transaction=null;}
  }
  close():void {if(!this.closed){this.db.close();this.closed=true;}}
}

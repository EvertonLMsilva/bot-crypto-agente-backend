import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { StoreOptions } from './types';
import { SCHEMA2_EXTENSION, validateLogicalCatalog } from './schema-v2';
export const SCHEMA_VERSION = 1;
const tables = `
CREATE TABLE simulations(id TEXT PRIMARY KEY,genesis TEXT NOT NULL,genesis_hash TEXT NOT NULL) STRICT;
CREATE TABLE operations(simulation_id TEXT NOT NULL REFERENCES simulations(id),operation_id TEXT NOT NULL,revision INTEGER NOT NULL,
 command_id TEXT NOT NULL,payload TEXT NOT NULL,payload_hash TEXT NOT NULL,receipt TEXT NOT NULL,
 PRIMARY KEY(simulation_id,operation_id),UNIQUE(simulation_id,revision),UNIQUE(simulation_id,command_id)) STRICT;
CREATE TABLE events(simulation_id TEXT NOT NULL,seq INTEGER NOT NULL,event_id TEXT NOT NULL,operation_id TEXT NOT NULL,ordinal INTEGER NOT NULL,
 kind TEXT NOT NULL,as_of TEXT NOT NULL,phase TEXT NOT NULL,payload TEXT NOT NULL,previous_hash TEXT NOT NULL,hash TEXT NOT NULL,schema_version INTEGER NOT NULL CHECK(schema_version=1),
 PRIMARY KEY(simulation_id,seq),UNIQUE(simulation_id,event_id),UNIQUE(simulation_id,operation_id,ordinal),
 FOREIGN KEY(simulation_id,operation_id) REFERENCES operations(simulation_id,operation_id)) STRICT;
CREATE TABLE postings(simulation_id TEXT NOT NULL,event_seq INTEGER NOT NULL,ordinal INTEGER NOT NULL,account TEXT NOT NULL,amount TEXT NOT NULL,
 PRIMARY KEY(simulation_id,event_seq,ordinal),FOREIGN KEY(simulation_id,event_seq) REFERENCES events(simulation_id,seq)) STRICT;
CREATE TABLE checkpoints(simulation_id TEXT NOT NULL,event_seq INTEGER NOT NULL,revision INTEGER NOT NULL,prefix_hash TEXT NOT NULL,state TEXT NOT NULL,state_hash TEXT NOT NULL,cursor TEXT NOT NULL,schema_version INTEGER NOT NULL CHECK(schema_version=1),
 PRIMARY KEY(simulation_id,event_seq),FOREIGN KEY(simulation_id,event_seq) REFERENCES events(simulation_id,seq)) STRICT;
CREATE TABLE runtime_control(simulation_id TEXT NOT NULL REFERENCES simulations(id),control_seq INTEGER NOT NULL,payload TEXT NOT NULL,previous_hash TEXT NOT NULL,hash TEXT NOT NULL,
 PRIMARY KEY(simulation_id,control_seq)) STRICT;
CREATE TABLE schema_migrations(version INTEGER PRIMARY KEY,checksum TEXT NOT NULL) STRICT;
`;
const protectedTables = ['simulations','operations','events','postings','checkpoints','runtime_control','schema_migrations'];
export const SCHEMA_SQL = tables + protectedTables.flatMap(t => ['UPDATE','DELETE'].map(action =>
  `CREATE TRIGGER ${t}_${action.toLowerCase()} BEFORE ${action} ON ${t} BEGIN SELECT RAISE(ABORT,'Append-only ${t}'); END;`)).join('\n');
const checksum = createHash('sha256').update(SCHEMA_SQL).digest('hex');
export const SCHEMA2_SQL=SCHEMA_SQL+'\n'+SCHEMA2_EXTENSION;
const checksum2=createHash('sha256').update(SCHEMA2_SQL).digest('hex');
function busy(e:unknown):boolean {return e instanceof Error && /database (?:table )?is locked|SQLITE_BUSY/.test(e.message);}
/** The caller supplies a consistent read or writer transaction. Never repairs a catalog. */
export function inspectSchema(db:DatabaseSync):0|1|2 {
 try{
  const version=db.prepare('PRAGMA user_version').get()!.user_version;
  if(version!==0 && version!==1 && version!==2)throw new RangeError('Unsupported schema version');
  validateLogicalCatalog(db,version===0?'':version===1?SCHEMA_SQL:SCHEMA2_SQL);
  if(version!==0){
   const rows=db.prepare('SELECT version,checksum FROM schema_migrations ORDER BY version').all();
   if(rows.length!==version || rows[0]!.version!==1 || rows[0]!.checksum!==checksum
    || version===2 && (rows[1]!.version!==2 || rows[1]!.checksum!==checksum2))throw new RangeError('Invalid schema metadata/checksum');
  }
  return version;
 }catch(e){if(busy(e))throw e;throw new RangeError('MANUAL_REVIEW_REQUIRED: schema recognition failed: '+String(e));}
}
/** Initialization only, never V1 -> V2 migration. Version target is pinned before the writer lock. */
export function migrate(db:DatabaseSync,options:StoreOptions):1|2 {
 db.exec('BEGIN');let observed:0|1|2;
 try{observed=inspectSchema(db);db.exec('COMMIT');}catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}
 const target=observed===0?options.schemaVersion??1:options.schemaVersion??observed;
 if(observed!==0 && observed!==target)throw new RangeError('SCHEMA_VERSION_CONFLICT');
 if(observed===0 && options.create!==true)throw new RangeError('Explicit create required for empty schema');
 options.fault?.('schema-inspected');
 const deadline=performance.now()+options.busyTimeoutMs;
 while(true){try{db.exec('PRAGMA journal_mode=WAL');break;}catch(e){
  if(!busy(e)||performance.now()>=deadline)throw e;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,Math.min(10,Math.max(0,deadline-performance.now())));
 }}
 db.exec('PRAGMA foreign_keys=ON; PRAGMA synchronous=FULL');
 if(db.prepare('PRAGMA journal_mode').get()!.journal_mode!=='wal' || db.prepare('PRAGMA synchronous').get()!.synchronous!==2 || db.prepare('PRAGMA foreign_keys').get()!.foreign_keys!==1)throw new RangeError('Required SQLite pragmas unavailable');
 db.exec('BEGIN IMMEDIATE');
 try{
  const locked=inspectSchema(db);
  if(locked===0){
   db.exec(target===1?SCHEMA_SQL:SCHEMA2_SQL);options.fault?.('schema-after-ddl');
   db.prepare('INSERT INTO schema_migrations VALUES(?,?)').run(1,checksum);
   if(target===2)db.prepare('INSERT INTO schema_migrations VALUES(?,?)').run(2,checksum2);
   options.fault?.('schema-after-metadata');db.exec('PRAGMA user_version='+target);
  }else if(locked!==target)throw new RangeError('SCHEMA_VERSION_CONFLICT');
  if(inspectSchema(db)!==target)throw new RangeError('Schema confirmation mismatch');
  options.fault?.('schema-before-commit');db.exec('COMMIT');
 }catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}
 options.fault?.('schema-after-commit');return target;
}

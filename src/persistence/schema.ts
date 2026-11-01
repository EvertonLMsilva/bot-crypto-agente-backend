import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
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
export function migrate(db: DatabaseSync): void {
  const v = db.prepare('PRAGMA user_version').get()!.user_version;
  if (v === 0) {
    db.exec('BEGIN IMMEDIATE');
    try {
      // Recheck under the write lock: another process may have initialized it.
      if (db.prepare('PRAGMA user_version').get()!.user_version === 0) {
        db.exec(SCHEMA_SQL); db.prepare('INSERT INTO schema_migrations VALUES(?,?)').run(1,checksum); db.exec('PRAGMA user_version=1');
      }
      db.exec('COMMIT');
    } catch(e) { db.exec('ROLLBACK'); throw e; }
  }
  if (db.prepare('PRAGMA user_version').get()!.user_version !== SCHEMA_VERSION
    || db.prepare('SELECT checksum FROM schema_migrations WHERE version=?').get(1)?.checksum !== checksum) {
    throw new RangeError('MANUAL_REVIEW_REQUIRED: unsupported or corrupted schema');
  }
}

import { DatabaseSync } from 'node:sqlite';
import { immutable } from '../budget/reservations';

/** Normative REF1 extension: byte-for-byte contract SQL. */
const Z = "0".repeat(64);

const ids = ["simulation_id", "operation_id"].map(n =>
  n+" TEXT NOT NULL CHECK(length("+n+") BETWEEN 1 AND 256 AND instr("+n+",char(0))=0 AND "+n+" NOT GLOB '*[^A-Za-z0-9._:-]*' AND substr("+n+",1,1) GLOB '[A-Za-z0-9]')"
);

const hashes = [
  "genesis_hash", "prefix_hash", "state_hash", "cursor_hash",
  "receipt_hash", "previous_ref_hash", "hash"
].map(n =>
  n+" TEXT NOT NULL CHECK(length("+n+")=64 AND instr("+n+",char(0))=0 AND "+n+" NOT GLOB '*[^0-9a-f]*')"
);

const statements = [
  "CREATE TABLE checkpoint_refs("+[
    ...ids,
    "checkpoint_index INTEGER NOT NULL CHECK(checkpoint_index>=0)",
    "revision INTEGER NOT NULL CHECK(revision>=0)",
    "event_seq INTEGER NOT NULL CHECK(event_seq>0)",
    "format TEXT NOT NULL CHECK(format='REF1')",
    "kind TEXT NOT NULL CHECK(kind IN ('GENESIS','CLOSE'))",
    ...hashes,
    "PRIMARY KEY(simulation_id,checkpoint_index)",
    "UNIQUE(simulation_id,event_seq)",
    "UNIQUE(simulation_id,revision)",
    "UNIQUE(simulation_id,operation_id)",
    "UNIQUE(simulation_id,hash)",
    "FOREIGN KEY(simulation_id) REFERENCES simulations(id)",
    "FOREIGN KEY(simulation_id,operation_id) REFERENCES operations(simulation_id,operation_id)",
    "FOREIGN KEY(simulation_id,event_seq) REFERENCES events(simulation_id,seq)",
    "CHECK((kind='GENESIS' AND checkpoint_index=0 AND revision=0 AND previous_ref_hash='"+Z+"') OR (kind='CLOSE' AND checkpoint_index>0 AND revision>0))"
  ].join(",")+") STRICT;",

  "CREATE TRIGGER checkpoint_refs_update BEFORE UPDATE ON checkpoint_refs BEGIN SELECT RAISE(ABORT,'Append-only checkpoint_refs'); END;",

  "CREATE TRIGGER checkpoint_refs_delete BEFORE DELETE ON checkpoint_refs BEGIN SELECT RAISE(ABORT,'Append-only checkpoint_refs'); END;",

  "CREATE TRIGGER checkpoints_ref1_only BEFORE INSERT ON checkpoints BEGIN SELECT RAISE(ABORT,'Schema2 requires REF1'); END;",

  "CREATE TRIGGER checkpoint_refs_insert BEFORE INSERT ON checkpoint_refs BEGIN "+
  "SELECT RAISE(ABORT,'REF1 order') WHERE NEW.checkpoint_index<>COALESCE((SELECT MAX(checkpoint_index)+1 FROM checkpoint_refs WHERE simulation_id=NEW.simulation_id),0) OR NEW.previous_ref_hash<>COALESCE((SELECT hash FROM checkpoint_refs WHERE simulation_id=NEW.simulation_id ORDER BY checkpoint_index DESC LIMIT 1),'"+Z+"') OR EXISTS(SELECT 1 FROM checkpoint_refs WHERE simulation_id=NEW.simulation_id AND (revision>=NEW.revision OR event_seq>=NEW.event_seq)); "+
  "SELECT RAISE(ABORT,'REF1 linkage') WHERE NOT EXISTS(SELECT 1 FROM simulations s JOIN operations o ON o.simulation_id=s.id JOIN events e ON e.simulation_id=o.simulation_id AND e.operation_id=o.operation_id WHERE s.id=NEW.simulation_id AND s.genesis_hash=NEW.genesis_hash AND o.operation_id=NEW.operation_id AND o.revision=NEW.revision AND e.seq=NEW.event_seq AND e.hash=NEW.prefix_hash AND e.kind='FINANCIAL_RECONCILIATION' AND e.phase='BEFORE_OPEN' AND e.seq=(SELECT MAX(seq) FROM events WHERE simulation_id=s.id AND operation_id=o.operation_id) AND o.revision=(SELECT MAX(revision) FROM operations WHERE simulation_id=s.id) AND ((NEW.kind='GENESIS' AND o.command_id='GENESIS') OR (NEW.kind='CLOSE' AND o.command_id<>'GENESIS' AND EXISTS(SELECT 1 FROM events ce WHERE ce.simulation_id=s.id AND ce.operation_id=o.operation_id AND ce.kind='CLOSED_CANDLE')))); END;"
];

const EXT = statements.join("\n");

export const SCHEMA2_EXTENSION=EXT;

type Meta=Record<string,string|number|null>;
const select=(row:Meta,keys:string[]):Meta=>Object.fromEntries(keys.map(k=>[k,row[k]!]));
const read=(db:DatabaseSync,sql:string):Meta[]=>db.prepare(sql).all() as Meta[];
const quote=(name:string):string=>'"'+name.replaceAll('"','""')+'"';
const encode=(value:unknown):string=>JSON.stringify(immutable(value));
const compare=(a:unknown,b:unknown):number=>encode(a)<encode(b)?-1:encode(a)>encode(b)?1:0;
function foreignKeys(rows:Meta[]) {
 const groups=new Map<Meta[string],Meta[]>();for(const row of rows){const group=groups.get(row.id!)??[];group.push(row);groups.set(row.id!,group);}
 return [...groups.values()].map(group=>{
  group.sort((a,b)=>Number(a.seq)-Number(b.seq));
  if(group.some((r,i)=>r.seq!==i || ['table','on_update','on_delete','match'].some(k=>r[k]!==group[0]![k])))throw new RangeError('Malformed schema FK metadata');
  return {...select(group[0]!,['table','on_update','on_delete','match']),columns:group.map(r=>select(r,['seq','from','to']))};
 }).sort(compare);
}
function indices(db:DatabaseSync,table:string) {
 return read(db,'PRAGMA main.index_list('+quote(table)+')').map(row=>{
  const name=String(row.name),columns=read(db,'PRAGMA main.index_xinfo('+quote(name)+')').map(r=>select(r,['seqno','cid','name','desc','coll','key'])).sort((a,b)=>Number(a.seqno)-Number(b.seqno));
  if(columns.some((r,i)=>r.seqno!==i))throw new RangeError('Malformed schema index metadata');
  const identity=row.origin==='c'?{kind:'explicit',name}:{kind:'implicit',table,origin:row.origin,unique:row.unique,partial:row.partial,columns};
  return {identity,unique:row.unique,origin:row.origin,partial:row.partial,columns,actualName:name};
 }).sort((a,b)=>compare(a.identity,b.identity));
}
function tableInfo(db:DatabaseSync,name:string) {
 return {columns:read(db,'PRAGMA main.table_xinfo('+quote(name)+')').map(r=>select(r,['cid','name','type','notnull','dflt_value','pk','hidden'])).sort((a,b)=>Number(a.cid)-Number(b.cid)),
  foreignKeys:foreignKeys(read(db,'PRAGMA main.foreign_key_list('+quote(name)+')')),
  indices:indices(db,name).map(({actualName,...logical})=>logical)};
}
function statsDefinition(db:DatabaseSync,row:Meta,tables:Meta[]) {
 const table=tables.find(t=>t.name===row.name);if(!table)throw new RangeError('Invalid schema statistics');
 return {schema:select(row,['type','name','tbl_name','sql']),table:select(table,['schema','name','type','ncol','wr','strict']),details:tableInfo(db,String(row.name))};
}
/** Logical, not physical: no rootpage, list ordinal or FK group number.
 * Complete SQL and all composite-column orderings remain part of identity. */
function catalog(db:DatabaseSync,stats:Record<string,unknown>={}) {
 if(read(db,'PRAGMA database_list').some(r=>r.name!=='main' && r.name!=='temp') || Number(db.prepare('SELECT count(*) n FROM temp.sqlite_schema').get()!.n)!==0)throw new RangeError('Unexpected schema attachment/temp object');
 const schema=read(db,'SELECT type,name,tbl_name,sql FROM main.sqlite_schema'),tables=read(db,'PRAGMA main.table_list').filter(r=>r.schema==='main'),omit=new Set<string>();
 for(const row of schema)if(Object.hasOwn(stats,String(row.name))){
  if(encode(statsDefinition(db,row,tables))!==encode(stats[String(row.name)]))throw new RangeError('Invalid schema statistics structure');omit.add(String(row.name));
 }
 const tableList=tables.filter(r=>!omit.has(String(r.name))).map(r=>select(r,['schema','name','type','ncol','wr','strict'])).sort((a,b)=>compare([a.schema,a.name],[b.schema,b.name]));
 const implicit=new Map<string,unknown>();
 const details=tableList.map(table=>{const name=String(table.name);for(const index of indices(db,name))if(index.origin!=='c')implicit.set(index.actualName,index.identity);
  return {identity:{schema:'main',name},...tableInfo(db,name)};
 });
 const objects=schema.filter(r=>!omit.has(String(r.name))).map(row=>{
  const name=String(row.name);let identity:unknown={kind:'named',type:row.type,name};
  if(row.type==='index' && row.sql===null){if(!implicit.has(name))throw new RangeError('Unmatched implicit schema index');identity=implicit.get(name);}
  else if(row.type==='index' && implicit.has(name))throw new RangeError('Implicit schema index has SQL');
  return {identity,type:row.type,tbl_name:row.tbl_name,sql:row.sql};
 }).sort(compare);
 for(const name of implicit.keys())if(schema.filter(r=>r.type==='index' && r.name===name && r.sql===null).length!==1)throw new RangeError('Missing implicit schema index');
 return {objects,tableList,tables:details};
}
/** Per recognition only. No cached catalog or financial proof survives a connection. */
export function validateLogicalCatalog(db:DatabaseSync,sql:string):void {
 const reference=new DatabaseSync(':memory:');
 try{
  if(sql)reference.exec(sql);const expected=catalog(reference),names=new Set(read(reference,'SELECT name FROM sqlite_schema').map(r=>r.name));reference.exec('ANALYZE');
  const stats:Record<string,unknown>={},tables=read(reference,'PRAGMA main.table_list').filter(r=>r.schema==='main');
  for(const row of read(reference,'SELECT type,name,tbl_name,sql FROM sqlite_schema').filter(r=>!names.has(r.name))){
   if(row.type!=='table' || !['sqlite_stat1','sqlite_stat4'].includes(String(row.name)))throw new RangeError('Unknown schema statistics object');
   stats[String(row.name)]=statsDefinition(reference,row,tables);
  }
  if(encode(catalog(db,stats))!==encode(expected))throw new RangeError('Logical schema mismatch');
 }finally{reference.close();}
}

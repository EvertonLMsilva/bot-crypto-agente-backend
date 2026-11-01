import { createHash } from 'node:crypto';
import { SimulationClock } from '../../src/simulation/clock';
import { SeededGenerator, CandleBatch } from '../../src/simulation/seeded-generator';
import { createMarketSource, SourceExhaustedError, FixtureProvider } from '../../src/simulation/market-source';
import { fixtureManifestHash, validateFixtureManifest } from '../../src/simulation/fixture-source';
import { canonical } from '../../src/persistence';
import { SimulationRuntime } from '../../src/runtime';
import { RuntimeConfiguration } from '../../src/persistence';
import { open, temp, cleanup, rows } from '../persistence/crash-worker';

const start='2026-01-01T00:00:00.000Z';
function fixture():FixtureProvider {
  const batches=Array.from({length:2},(_,i)=>Object.freeze((['BTC','ETH'] as const).map(asset=>({asset,
    openTime:new Date(Date.parse(start)+i*300000).toISOString(),closeTime:new Date(Date.parse(start)+(i+1)*300000).toISOString(),
    open:i===0?'100.00000000':'80.00000000',high:i===0?'102.00000000':'85.00000000',low:i===0?'99.00000000':'75.00000000',close:i===0?'101.00000000':'81.00000000',volume:'0.00000000'}))) as unknown as CandleBatch);
  const body={version:'1' as const,id:'gap-fixture',startTime:start,batches},hash=fixtureManifestHash(body),identity='fixture-market/1:'+hash;
  return {id:'fixture-market',version:'1',identity,seed:identity,initialPrices:{BTC:'100.00000000',ETH:'100.00000000'},manifest:{...body,hash}};
}
test('factory preserves direct seeded results, provider identity and no random consumption',()=>{
 const config={id:'seeded-generator' as const,version:'1' as const,seed:'compatibility',initialPrices:{BTC:'100.00000000',ETH:'200.00000000'}};
 const source=createMarketSource(new SimulationClock(start),config),direct=new SeededGenerator(new SimulationClock(start),config);
 expect(source.provider.id).toBe(config.id);for(let i=0;i<12;i++){expect(source.currentOpenings()).toEqual(direct.currentOpenings());expect(source.currentOpenings()).toEqual(source.currentOpenings());expect(source.next()).toEqual(direct.next());}
});
test('fixture observation is causal, copied and immutable; price gap is kept verbatim',()=>{
 const descriptor=fixture(),clock=new SimulationClock(start),source=createMarketSource(clock,descriptor),before=clock.snapshot();
 const openings=source.currentOpenings();expect(source.currentOpenings()).toEqual(openings);expect(clock.snapshot()).toEqual(before);
 expect(Object.isFrozen(openings)).toBe(true);for(const o of openings){expect(Object.keys(o).sort()).toEqual(['asOf','asset','price']);expect(Object.isFrozen(o)).toBe(true);}
 const first=source.next();expect(first[0].close).toBe('101.00000000');expect(Object.isFrozen(first[0])).toBe(true);
 expect(source.currentOpenings()[0]!.price).toBe('80.00000000');expect(clock.snapshot().steps).toBe(1);
 expect(source.next()).toEqual(descriptor.manifest.batches[1]);
 const end=clock.snapshot();expect(()=>source.currentOpenings()).toThrow(SourceExhaustedError);expect(()=>source.next()).toThrow(SourceExhaustedError);expect(clock.snapshot()).toEqual(end);
});
test('manifest hash is canonical SHA256, excludes hash, and commits even unconfirmed tail',()=>{
 const p=fixture(),{hash,...body}=p.manifest;
 expect(hash).toBe(createHash('sha256').update(canonical(body)).digest('hex'));
 expect(fixtureManifestHash({...p.manifest,hash:'different'})).toBe(hash);
 const reversed=JSON.parse(JSON.stringify(body),(_key,value)=>value && !Array.isArray(value) && typeof value==='object'?Object.fromEntries(Object.entries(value).reverse()):value);
 expect(fixtureManifestHash(reversed)).toBe(hash);
 const changed=structuredClone(body);Object.assign(changed.batches[1]![0],{close:'82.00000000'});expect(fixtureManifestHash(changed)).not.toBe(hash);
});

test('a different future is a different simulation identity, with identical past observations',()=>{
 const original=fixture(),changed:any=structuredClone(original);
 changed.manifest.batches[1][0].close='82.00000000';changed.manifest.hash=fixtureManifestHash(changed.manifest);changed.identity=changed.seed='fixture-market/1:'+changed.manifest.hash;
 const a=createMarketSource(new SimulationClock(start),original),b=createMarketSource(new SimulationClock(start),changed);
 expect(a.provider.identity).not.toBe(b.provider.identity);expect(a.currentOpenings()).toEqual(b.currentOpenings());expect(a.next()).toEqual(b.next());
 expect(a.currentOpenings()).toEqual(b.currentOpenings());expect(a.next()).not.toEqual(b.next());
});
test.each(['version','id','start','empty','pair','asset','gap','duration','price','high','low','volume','hash','extra'])('rejects invalid manifest %s before any source step',kind=>{
 const p:any=structuredClone(fixture()),m=p.manifest;
 if(kind==='version')m.version='2';else if(kind==='id')m.id='';else if(kind==='start')m.startTime='2026-01-01';else if(kind==='empty')m.batches=[];
 else if(kind==='pair')m.batches[0].pop();else if(kind==='asset')m.batches[0][1].asset='BTC';else if(kind==='gap')m.batches[1][0].openTime='2026-01-01T00:10:00.000Z';
 else if(kind==='duration')m.batches[0][1].closeTime='2026-01-01T00:10:00.000Z';else if(kind==='price')m.batches[0][0].open='100';else if(kind==='high')m.batches[0][0].high='99.00000000';
 else if(kind==='low')m.batches[0][0].low='0.00000000';else if(kind==='volume')m.batches[0][0].volume='-1.00000000';else if(kind==='hash')m.hash='0'.repeat(64);else m.unknown=true;
 const clock=new SimulationClock(start);expect(()=>createMarketSource(clock,p)).toThrow(RangeError);expect(clock.snapshot().steps).toBe(0);
});
test.each(['identity','seed','initialPrices','provider','providerVersion','extra'])('rejects divergent provider %s',kind=>{
 const p:any=structuredClone(fixture());if(kind==='identity')p.identity='other';else if(kind==='seed')p.seed='random-seed';else if(kind==='initialPrices')p.initialPrices.BTC='90.00000000';
 else if(kind==='provider')p.id='unknown';else if(kind==='providerVersion')p.version='future';else p.unknown=true;
 expect(()=>createMarketSource(new SimulationClock(start),p)).toThrow(RangeError);
});
test('source owns its frozen copy and rejects an advanced or differently originated clock',()=>{
 const input=structuredClone(fixture()),source=createMarketSource(new SimulationClock(start),input);Object.assign(input.manifest.batches[0]![0],{close:'999.00000000'});
 expect(source.next()[0].close).toBe('101.00000000');expect(Object.isFrozen(validateFixtureManifest(fixture().manifest).batches)).toBe(true);
 const clock=new SimulationClock(start);clock.step();expect(()=>createMarketSource(clock,fixture())).toThrow();
 expect(()=>createMarketSource(new SimulationClock('2026-01-01T01:00:00.000Z'),fixture())).toThrow();
 const externalClock=new SimulationClock(start),owned=createMarketSource(externalClock,fixture());externalClock.step();expect(()=>owned.next()).toThrow();expect(()=>owned.currentOpenings()).toThrow();
});
test.each([{}, {id:'seeded-generator',version:'1',seed:'x'}, {id:'seeded-generator',version:'1',seed:'',initialPrices:{BTC:'1.00000000',ETH:'1.00000000'}},
 {id:'seeded-generator',version:'1',seed:'x',initialPrices:{BTC:'1.00000000'}}, {id:'seeded-generator',version:'future',seed:'x',initialPrices:{BTC:'1.00000000',ETH:'1.00000000'}}])('factory never supplies silent seeded defaults %#',input=>{
 expect(()=>createMarketSource(new SimulationClock(start),input as never)).toThrow(RangeError);
});

describe('FIX-001: complete arrays before genesis',()=>{
 afterEach(cleanup);
 function rehash(p:FixtureProvider):void {
  const {hash:previous,...body}=p.manifest;
  // Independent canonical serialization preserves holes as null in the hash payload.
  const hash=createHash('sha256').update(canonical(body)).digest('hex');
  Object.assign(p.manifest,{hash});Object.assign(p,{identity:'fixture-market/1:'+hash,seed:'fixture-market/1:'+hash});
 }
 test.each([0,1,2])('rejects missing batch index %i even with a recomputed canonical hash',index=>{
  const p:any=structuredClone(fixture());p.manifest.batches.length=3;delete p.manifest.batches[index];rehash(p);
  expect(()=>validateFixtureManifest(p.manifest)).toThrow(RangeError);
  expect(()=>validateFixtureManifest(JSON.parse(JSON.stringify(p.manifest)))).toThrow(RangeError);
 });
 test.each([0,1])('rejects missing BTC/ETH index %i in a later pair',index=>{
  const p:any=structuredClone(fixture());delete p.manifest.batches[1][index];rehash(p);
  expect(()=>validateFixtureManifest(p.manifest)).toThrow(RangeError);
 });
 test.each(['batch-null','batch-undefined','candle-null','candle-undefined'])('rejects explicitly present invalid element %s',kind=>{
  const p:any=structuredClone(fixture()),value=kind.endsWith('null')?null:undefined;
  if(kind.startsWith('batch'))p.manifest.batches[1]=value;else p.manifest.batches[1][1]=value;
  expect(()=>validateFixtureManifest(p.manifest)).toThrow(RangeError);
 });
 test.each(['batch','pair'])('rejects sparse %s before calling createSimulation',kind=>{
  const p:any=structuredClone(fixture());if(kind==='batch')p.manifest.batches.length=3;else delete p.manifest.batches[1][1];rehash(p);
  const policy=(asset:'BTC'|'ETH')=>({id:`${asset}-P0`,asset,version:'1',state:'UNVALIDATED' as const,families:(['TREND','BREAKOUT','MEAN_REVERSION'] as const).map(family=>({family,id:family,version:'1'}))});
  const config:RuntimeConfiguration={version:'2',simulationId:'sparse',startTime:start,initialCapital:'10000.00000000',provider:p,policies:{BTC:policy('BTC'),ETH:policy('ETH')},context:{id:'context',version:'1',feed:{status:'VALID',events:[]}},warmup:{hourlyCandles:150}};
  const path=temp(),d=open(path),create=jest.spyOn(d,'createSimulation'),runtime=new SimulationRuntime(d);
  expect(()=>runtime.create(config,{nextTieAsset:'BTC'})).toThrow(RangeError);
  expect(create).not.toHaveBeenCalled();expect(rows(path,'simulations')).toEqual([]);expect(rows(path,'operations')).toEqual([]);
 });
 test('valid JSON round-trip preserves identity, hash, all candles and exhaustion',()=>{
  const p=fixture(),restored=JSON.parse(JSON.stringify(p)) as FixtureProvider;
  expect(restored).toEqual(p);expect(fixtureManifestHash(restored.manifest)).toBe(p.manifest.hash);
  expect(validateFixtureManifest(restored.manifest)).toEqual(p.manifest);
  const a=createMarketSource(new SimulationClock(start),p),b=createMarketSource(new SimulationClock(start),restored);
  expect(a.provider).toEqual(b.provider);for(let i=0;i<2;i++){expect(a.currentOpenings()).toEqual(b.currentOpenings());expect(a.next()).toEqual(b.next());}
  expect(()=>a.next()).toThrow(SourceExhaustedError);expect(()=>b.next()).toThrow(SourceExhaustedError);
 });
 test('valid manifest remains accepted unchanged without mutating caller data',()=>{
  const p=fixture(),before=canonical(p),validated=validateFixtureManifest(p.manifest);
  expect(validated).toEqual(p.manifest);expect(canonical(p)).toBe(before);expect(validated).not.toBe(p.manifest);
  expect(validated.hash).toBe(p.manifest.hash);expect(Object.isFrozen(validated.batches[1])).toBe(true);
 });
});

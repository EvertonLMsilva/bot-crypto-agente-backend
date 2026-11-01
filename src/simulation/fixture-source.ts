import { createHash } from 'node:crypto';
import { ASSETS, Asset, parsePositivePrice } from './candle';
import { SimulationClock } from './clock';
import { CandleBatch } from './seeded-generator';
import type { FixtureManifest, FixtureProvider, MarketSource } from './market-source';

export class SourceExhaustedError extends RangeError {
  readonly code='SOURCE_EXHAUSTED';
  constructor(){super('SOURCE_EXHAUSTED: no unconfirmed fixture interval');}
}

function requireFixture(condition:unknown,message:string):asserts condition {if(!condition)throw new RangeError(message);}
function keys(value:object,expected:string[]):void {
  requireFixture(value && typeof value==='object' && Object.keys(value).sort().join('|')===expected.sort().join('|'),'Invalid fixture structure');
}
/** Fixed canonical field order equals sorted-key JSON; the hash field is excluded. */
export function fixtureManifestHash(input:Omit<FixtureManifest,'hash'>|FixtureManifest):string {
  const payload={batches:input.batches.map(batch=>batch.map(c=>({asset:c.asset,close:c.close,closeTime:c.closeTime,high:c.high,low:c.low,open:c.open,openTime:c.openTime,volume:c.volume}))),
    id:input.id,startTime:input.startTime,version:input.version};
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}
export function validateFixtureManifest(input:FixtureManifest):FixtureManifest {
  keys(input,['version','id','startTime','batches','hash']);
  requireFixture(input.version==='1' && typeof input.id==='string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(input.id),'Unsupported fixture manifest identity/version');
  requireFixture(typeof input.startTime==='string','Explicit fixture UTC origin required');
  const clock=new SimulationClock(input.startTime);
  requireFixture(clock.startTime===input.startTime && Array.isArray(input.batches) && input.batches.length>0,'Canonical nonempty fixture sequence required');
  const batches=Array.from(input.batches,(batch,batchIndex)=>{
    requireFixture(Object.hasOwn(input.batches,batchIndex),'Sparse fixture batches');
    requireFixture(Array.isArray(batch) && batch.length===2,'Fixture requires complete BTC/ETH pairs');
    const interval=clock.step();
    return Object.freeze(Array.from(batch,(c,index)=>{
      requireFixture(Object.hasOwn(batch,index),'Sparse fixture pair');
      keys(c,['asset','openTime','closeTime','open','high','low','close','volume']);
      requireFixture(c.asset===ASSETS[index] && c.openTime===interval.openTime && c.closeTime===interval.closeTime,'Invalid fixture asset/order/continuous interval');
      const o=parsePositivePrice(c.open),h=parsePositivePrice(c.high),l=parsePositivePrice(c.low),p=parsePositivePrice(c.close);
      if(c.volume!=='0.00000000')parsePositivePrice(c.volume);
      requireFixture(l<=o && l<=p && h>=o && h>=p && h>=l,'Invalid fixture OHLC');
      return Object.freeze({...c});
    })) as unknown as CandleBatch;
  });
  requireFixture(typeof input.hash==='string' && /^[a-f0-9]{64}$/.test(input.hash) && fixtureManifestHash(input)===input.hash,'Fixture manifest hash mismatch');
  return Object.freeze({version:'1',id:input.id,startTime:input.startTime,batches:Object.freeze(batches),hash:input.hash});
}
export function validateFixtureProvider(input:FixtureProvider):FixtureProvider {
  keys(input,['id','version','identity','seed','initialPrices','manifest']);
  requireFixture(input.id==='fixture-market' && input.version==='1','Unsupported fixture provider');
  const manifest=validateFixtureManifest(input.manifest),identity='fixture-market/1:'+manifest.hash;
  requireFixture(input.identity===identity && input.seed===identity,'Fixture reproduction identity mismatch');
  keys(input.initialPrices,['BTC','ETH']);
  for(const [index,asset] of ASSETS.entries())requireFixture(input.initialPrices[asset]===manifest.batches[0]![index]!.open,'Fixture explicit initial price differs');
  return Object.freeze({id:'fixture-market',version:'1',identity,seed:identity,initialPrices:Object.freeze({...input.initialPrices}),manifest});
}
export class FixtureSource implements MarketSource {
  readonly provider:MarketSource['provider'];
  #manifest:FixtureManifest;
  #index=0;
  constructor(private readonly clock:SimulationClock,input:FixtureProvider){
    const config=validateFixtureProvider(input);this.#manifest=config.manifest;
    requireFixture(clock.snapshot().steps===0 && clock.startTime===config.manifest.startTime,'Fixture requires its unadvanced origin clock');
    this.provider=Object.freeze({id:config.id,version:config.version,identity:config.identity,manifestHash:config.manifest.hash});
  }
  private batch():CandleBatch {
    requireFixture(this.clock.snapshot().steps===this.#index,'Fixture clock advanced externally');
    const batch=this.#manifest.batches[this.#index];if(!batch)throw new SourceExhaustedError();return batch;
  }
  currentOpenings():readonly Readonly<{asset:Asset;asOf:string;price:string}>[] {
    return Object.freeze(this.batch().map(c=>Object.freeze({asset:c.asset,asOf:c.openTime,price:c.open})));
  }
  next():CandleBatch {
    const batch=this.batch();this.clock.step();this.#index++;return batch;
  }
}

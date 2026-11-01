import { Asset } from './candle';
import { SimulationClock } from './clock';
import { SeededGenerator, CandleBatch } from './seeded-generator';
import { FixtureSource } from './fixture-source';
export { SourceExhaustedError } from './fixture-source';

export interface SeededProvider {
  readonly id:'seeded-generator'; readonly version:'1'; readonly seed:string;
  readonly initialPrices:Readonly<Record<Asset,string>>;
}
export interface FixtureManifest {
  readonly version:'1'; readonly id:string; readonly startTime:string;
  readonly batches:readonly CandleBatch[]; readonly hash:string;
}
export interface FixtureProvider {
  readonly id:'fixture-market'; readonly version:'1'; readonly identity:string;
  /** Legacy D5 cursor bridge: reproduction identity, NOT a random seed. */
  readonly seed:string; readonly initialPrices:Readonly<Record<Asset,string>>; readonly manifest:FixtureManifest;
}
export type MarketProvider=SeededProvider|FixtureProvider;
export interface MarketSource {
  readonly provider:Readonly<{id:string;version:string;identity:string;manifestHash:string|null}>;
  currentOpenings():readonly Readonly<{asset:Asset;asOf:string;price:string}>[];
  next():CandleBatch;
}
/** Same causal interface; the published seeded generator is not modified. */
export function createMarketSource(clock:SimulationClock,config:MarketProvider):MarketSource {
  if(config?.id==='fixture-market')return new FixtureSource(clock,config);
  if(!config || config.id!=='seeded-generator' || config.version!=='1')throw new RangeError('Unsupported market provider');
  if(Object.keys(config).sort().join('|')!=='id|initialPrices|seed|version' || typeof config.seed!=='string' || !config.seed.trim()
    || !config.initialPrices || Object.keys(config.initialPrices).sort().join('|')!=='BTC|ETH')throw new RangeError('Explicit seeded provider configuration required');
  const seeded=new SeededGenerator(clock,config);
  return Object.freeze({provider:Object.freeze({id:config.id,version:config.version,identity:config.seed,manifestHash:null}),
    currentOpenings:()=>seeded.currentOpenings(),next:()=>seeded.next()});
}

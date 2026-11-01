import { SimulationClock, ClosedInterval } from './clock';
import { ASSETS, Asset, Candle, parsePositivePrice, toDecimalString } from './candle';

export interface GeneratorConfig {
  readonly seed: string;
  readonly initialPrices?: Readonly<Record<Asset, string>>;
}

type AssetState = { price: bigint; random: number };
export type CandleBatch = readonly [Readonly<Candle>, Readonly<Candle>];
const DEFAULT_PRICES = Object.freeze({ BTC: '60000.00000000', ETH: '3000.00000000' });

// Version 1: FNV-1a seed hashing and separate xorshift32 streams per asset.
// Number arithmetic here is only 32-bit integer PRNG state; all prices use bigint.
function seedState(seed: string, asset: Asset): number {
  let state = 2166136261;
  const key = `${seed}\0${asset}`;
  for (let i = 0; i < key.length; i++) state = Math.imul(state ^ key.charCodeAt(i), 16777619) >>> 0;
  return state || 0x9e3779b9;
}

function draw(state: AssetState): number {
  let value = state.random;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  state.random = value >>> 0;
  return state.random;
}

function positive(value: bigint): bigint { return value > 0n ? value : 1n; }

/** Initial synthetic fixture generator, NOT the six official market scenarios. */
export class SeededGenerator {
  #states: Record<Asset, AssetState>;
  #steps = 0;

  constructor(private readonly clock: SimulationClock, config: GeneratorConfig) {
    if (config.seed.trim().length === 0) throw new RangeError('An explicit non-empty seed is required');
    if (clock.snapshot().steps !== 0) throw new Error('Generator requires an unadvanced clock');
    const prices = config.initialPrices ?? DEFAULT_PRICES;
    this.#states = {
      BTC: { price: parsePositivePrice(prices.BTC), random: seedState(config.seed, 'BTC') },
      ETH: { price: parsePositivePrice(prices.ETH), random: seedState(config.seed, 'ETH') },
    };
  }

  /** Known prices only: observation consumes neither clock nor random stream. */
  currentOpenings(): readonly Readonly<{ asset: Asset; asOf: string; price: string }>[] {
    const clock = this.clock.snapshot();
    if (clock.steps !== this.#steps) throw new Error('Clock advanced outside its generator');
    return Object.freeze(ASSETS.map(asset => Object.freeze({ asset, asOf: clock.currentTime, price: toDecimalString(this.#states[asset].price) })));
  }

  /** Sole clock owner: a batch becomes available only after its interval closes. */
  next(): CandleBatch {
    if (this.clock.snapshot().steps !== this.#steps) throw new Error('Clock advanced outside its generator');
    const interval = this.clock.step();
    const batch = Object.freeze([this.closedCandle(ASSETS[0], interval), this.closedCandle(ASSETS[1], interval)] as const);
    this.#steps += 1;
    return batch;
  }

  private closedCandle(asset: Asset, interval: ClosedInterval): Readonly<Candle> {
    const state = this.#states[asset];
    const open = state.price;
    const moveBasisPoints = BigInt(draw(state) % 101) - 50n;
    const close = positive(open + (open * moveBasisPoints) / 10_000n);
    const upperWick = positive((open * BigInt(draw(state) % 26)) / 10_000n);
    const lowerWick = positive((open * BigInt(draw(state) % 26)) / 10_000n);
    const high = (open > close ? open : close) + upperWick;
    const low = positive((open < close ? open : close) - lowerWick);
    const volume = BigInt(draw(state) % 1_000_001) * 100_000_000n;
    state.price = close;
    return Object.freeze({
      asset, openTime: interval.openTime, closeTime: interval.closeTime,
      open: toDecimalString(open), high: toDecimalString(high),
      low: toDecimalString(low), close: toDecimalString(close), volume: toDecimalString(volume),
    });
  }
}

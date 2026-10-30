export const ASSETS = Object.freeze(['BTC', 'ETH'] as const);
export type Asset = typeof ASSETS[number];
const SCALE = 100_000_000n;

/** Synthetic closed market data only: no regime labels or forming/future candles. */
export interface Candle {
  readonly asset: Asset;
  readonly openTime: string;
  readonly closeTime: string;
  readonly open: string;
  readonly high: string;
  readonly low: string;
  readonly close: string;
  readonly volume: string;
}

/** Exact fixed-point serialization, not a financial accounting implementation. */
export function toDecimalString(units: bigint): string {
  if (units < 0n) throw new RangeError('Decimal units must be non-negative');
  return `${units / SCALE}.${(units % SCALE).toString().padStart(8, '0')}`;
}

export function parsePositivePrice(value: string): bigint {
  if (!/^(0|[1-9]\d*)\.\d{8}$/.test(value)) throw new RangeError('Price must be a canonical decimal with eight places');
  const units = BigInt(value.replace('.', ''));
  if (units <= 0n) throw new RangeError('Price must be positive');
  return units;
}

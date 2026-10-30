import { Candle } from '../simulation/candle';
import { FIVE_MINUTES_MS, SimulationClock } from '../simulation/clock';
import { IndicatorTimeframe, NumericCandle } from './types';

/** Reject arithmetic overflow rather than publish an invented fallback. */
export function finiteResult(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError('Non-finite indicator value');
  return value;
}

function boundary(value: string): number {
  if (typeof value !== 'string') throw new RangeError('Explicit UTC simulation time is required');
  // Reuse the clock's calendar, UTC and five-minute alignment contract.
  return Date.parse(new SimulationClock(value).snapshot().currentTime);
}

function decimal(value: string): { units: bigint; numeric: number } {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)\.\d{8}$/.test(value)) {
    throw new RangeError('OHLCV must use canonical eight-place non-negative decimals');
  }
  return { units: BigInt(value.replace('.', '')), numeric: finiteResult(Number(value)) };
}

/** asOf is the caller's explicit simulation clock boundary, never wall time.
 * Reject the entire history on invalidity; do not fill, sort, trim or skip data.
 * Number conversion is solely for statistics; OHLC consistency is checked exactly.
 * Distinct exact prices must remain distinguishable after conversion to Number.
 */
export function validateHistory(candles: readonly Candle[], asOf: string, timeframe: IndicatorTimeframe = '5m'): readonly NumericCandle[] {
  if (timeframe !== '5m' && timeframe !== '1h') throw new RangeError('Unsupported indicator timeframe');
  const duration = timeframe === '5m' ? FIVE_MINUTES_MS : 3_600_000;
  const availableAt = boundary(asOf);
  if (!Array.isArray(candles)) throw new RangeError('Candle history must be an array');
  const result: NumericCandle[] = [];
  const exactPrices = new Map<number, bigint>();
  let previousClose: number | undefined;
  let asset: Candle['asset'] | undefined;
  for (const candle of candles) {
    if (!candle || (candle.asset !== 'BTC' && candle.asset !== 'ETH')) {
      throw new RangeError('A valid BTC or ETH candle is required');
    }
    if (asset !== undefined && asset !== candle.asset) throw new RangeError('Mixed assets');
    asset = candle.asset;
    const openTime = boundary(candle.openTime);
    const closeTime = boundary(candle.closeTime);
    if (closeTime - openTime !== duration || openTime % duration !== 0
      || (previousClose !== undefined && openTime !== previousClose)
      || closeTime > availableAt) {
      throw new RangeError('History must be continuous, chronological and already closed at asOf');
    }
    previousClose = closeTime;
    const open = decimal(candle.open), high = decimal(candle.high), low = decimal(candle.low);
    const close = decimal(candle.close), volume = decimal(candle.volume);
    if (low.units <= 0n || open.units < low.units || close.units < low.units
      || high.units < low.units || high.units < open.units || high.units < close.units) {
      throw new RangeError('Inconsistent or non-positive OHLC');
    }
    // Check all OHLC prices across this history, not just adjacent closes.
    // Equal prices remain valid; only erased exact differences are rejected.
    for (const price of [open, high, low, close]) {
      const previousUnits = exactPrices.get(price.numeric);
      if (previousUnits !== undefined && previousUnits !== price.units) {
        throw new RangeError('Insufficient price precision: distinct decimal prices collapse to the same Number');
      }
      exactPrices.set(price.numeric, price.units);
    }
    result.push({ open: open.numeric, high: high.numeric, low: low.numeric,
      close: close.numeric, volume: volume.numeric });
  }
  return result;
}

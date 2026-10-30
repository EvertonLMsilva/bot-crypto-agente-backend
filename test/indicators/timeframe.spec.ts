import { ema, atr, adx, validateHistory, IndicatorTimeframe, rsi, bollinger } from '../../src/indicators';
import { Candle, toDecimalString as dec } from '../../src/simulation/candle';

function fixture(timeframe: IndicatorTimeframe, count = 55): Candle[] {
  const step = timeframe === '1h' ? 3_600_000 : 300_000;
  return Array.from({ length: count }, (_, i) => {
    const close = 10_000_000_000n + BigInt(i) * 100_000_000n;
    return { asset: 'BTC', openTime: new Date(Date.UTC(2026, 0, 1) + i * step).toISOString(),
      closeTime: new Date(Date.UTC(2026, 0, 1) + (i + 1) * step).toISOString(),
      open: dec(close), close: dec(close), high: dec(close + 100_000_000n), low: dec(close - 100_000_000n), volume: '0.00000000' };
  });
}
const now = '2026-01-04T00:00:00.000Z';
const consumers = [
  ['validation', validateHistory],
  ['ema20', (c: readonly Candle[], t: string, f?: IndicatorTimeframe) => ema(c, t, 20, f)],
  ['ema50', (c: readonly Candle[], t: string, f?: IndicatorTimeframe) => ema(c, t, 50, f)],
  ['atr', atr], ['adx', adx],
] as const;

test.each(consumers)('%s preserves defaults and accepts explicit 1h', (_, calculate) => {
  const five = fixture('5m'), hourly = fixture('1h');
  expect(calculate(five, now)).toEqual(calculate(five, now, '5m'));
  expect(calculate(hourly, now, '1h')).toEqual(calculate(five, now));
  expect(() => calculate(hourly, now)).toThrow(RangeError);
  expect(() => calculate(five, now, '1h')).toThrow(RangeError);
  expect(() => calculate(hourly, now, '15m' as IndicatorTimeframe)).toThrow(RangeError);
});

test('hourly mathematical indices and formulas remain unchanged', () => {
  const input = fixture('1h');
  const fast = ema(input, now, 20, '1h'), slow = ema(input, now, 50, '1h');
  expect(fast.slice(0, 19)).toEqual(Array(19).fill(null));
  expect(fast[19]).toBe(109.5); expect(fast[20]).toBe(110.5);
  expect(slow.slice(0, 49)).toEqual(Array(49).fill(null)); expect(slow[49]).toBe(124.5);
  expect(atr(input, now, '1h').slice(0, 14)).toEqual(Array(14).fill(null));
  expect(atr(input, now, '1h')[14]).toBe(2);
  const directional = adx(input, now, '1h');
  expect(directional.slice(0, 14)).toEqual(Array(14).fill(null));
  expect(directional[14]).toEqual({ plusDI: 50, minusDI: 0, dx: 100, adx: null });
  expect(directional[27]!.adx).toBe(100);
  expect(() => rsi(input, now)).toThrow(RangeError);
  expect(() => bollinger(input, now)).toThrow(RangeError);
});

test.each(['5m', '1h'] as const)('precision, future, alignment, gaps and OHLCV guard remain active in %s', timeframe => {
  const input = fixture(timeframe);
  expect(() => validateHistory(input, input[53]!.closeTime, timeframe)).toThrow(RangeError);
  expect(() => validateHistory(input.slice(1).map(c => ({ ...c,
    openTime: new Date(Date.parse(c.openTime) + 300_000).toISOString(),
    closeTime: new Date(Date.parse(c.closeTime) + 300_000).toISOString() })), now, '1h')).toThrow(RangeError);
  expect(() => validateHistory([...input.slice(0, 3), ...input.slice(4)], now, timeframe)).toThrow(RangeError);
  expect(() => validateHistory([{ ...input[0]!, volume: '-1.00000000' }], now, timeframe)).toThrow(RangeError);
  const base = 1_000_000_000_000_000_000_000_000n;
  const collision = input.slice(0, 2).map((c, i) => {
    const v = dec(base + BigInt(i)); return { ...c, open: v, high: v, low: v, close: v };
  });
  for (const [, calculate] of consumers) expect(() => calculate(collision, now, timeframe)).toThrow(/precision/i);
});

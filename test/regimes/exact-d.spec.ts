import { compareExactD } from '../../src/regimes/exact-d';
import { Candle, toDecimalString as dec } from '../../src/simulation/candle';
import { ema, atr } from '../../src/indicators';

function fixture(direction = 1n, wickAdjustment = 0n, count = 52, base = 6_000_000_000_000n): Candle[] {
  return Array.from({ length: count }, (_, i) => {
    const close = base + direction * BigInt(i) * 10_000_000n;
    return { asset: 'BTC', openTime: new Date(Date.UTC(2026, 0, 1, 0, i * 5)).toISOString(),
      closeTime: new Date(Date.UTC(2026, 0, 1, 0, (i + 1) * 5)).toISOString(),
      open: dec(close), close: dec(close), high: dec(close + 300_000_000n + wickAdjustment),
      low: dec(close - 300_000_000n), volume: '1.00000000' };
  });
}

test('original RED regression: Number misses D=1.5/6; exact comparison meets +0.25', () => {
  const input = fixture();
  const now = input.at(-1)!.closeTime;
  expect((ema(input, now, 20)[49]! - ema(input, now, 50)[49]!) / atr(input, now)[49]!).toBeLessThan(0.25);
  expect(compareExactD(input)[49]).toBe('POSITIVE_THRESHOLD_MET');
});

test.each([
  [1n, 0n, 'POSITIVE_THRESHOLD_MET'], [1n, 1n, 'BETWEEN_THRESHOLDS'],
  [1n, -1n, 'POSITIVE_THRESHOLD_MET'], [-1n, 0n, 'NEGATIVE_THRESHOLD_MET'],
  [-1n, 1n, 'BETWEEN_THRESHOLDS'], [-1n, -1n, 'NEGATIVE_THRESHOLD_MET'],
] as const)('exact boundary: direction %s, range tick change %s -> %s', (direction, change, expected) => {
  const result = compareExactD(fixture(direction, change));
  expect(result.slice(0, 49)).toEqual(Array(49).fill('UNAVAILABLE'));
  expect(result[49]).toBe(expected);
});

test('zero ATR, insufficient and malformed data are unavailable', () => {
  expect(compareExactD([])).toEqual([]);
  expect(compareExactD(fixture().slice(0, 49))).toEqual(Array(49).fill('UNAVAILABLE'));
  const flat = fixture().map(c => ({ ...c, open: '10.00000000', high: '10.00000000', low: '10.00000000', close: '10.00000000' }));
  expect(compareExactD(flat)).toEqual(Array(flat.length).fill('UNAVAILABLE'));
  expect(compareExactD([{ ...flat[0]!, close: 'NaN' }])).toEqual(['UNAVAILABLE']);
  expect(compareExactD([{ ...flat[0]!, low: '0.00000000' }])).toEqual(['UNAVAILABLE']);
  expect(compareExactD([null] as unknown as Candle[])).toEqual(['UNAVAILABLE']);
});

test('causal, immutable, stateless BTC/ETH and independent of candle timeframe', () => {
  const input = Object.freeze(fixture(1n, 0n, 65).map(c => Object.freeze(c)));
  const before = JSON.stringify(input), result = compareExactD(input);
  for (const size of [1, 14, 49, 50, 60]) expect(compareExactD(input.slice(0, size))).toEqual(result.slice(0, size));
  expect(compareExactD(input.map((c, i) => ({ ...c, asset: 'ETH',
    openTime: new Date(Date.UTC(2026, 0, 1, i)).toISOString(),
    closeTime: new Date(Date.UTC(2026, 0, 1, i + 1)).toISOString() })))).toEqual(result);
  compareExactD(fixture(-1n));
  expect(compareExactD(input)).toEqual(result);
  expect(JSON.stringify(input)).toBe(before);
});

test('large prices: comparisons use exact ticks, not converted floats', () => {
  // Representable whole-unit moves at this magnitude; spread=15, ATR=60.
  const base = 1_000_000_000_000_000_000_000_000n;
  const input = fixture(1n, 0n, 50, base).map((c, i) => {
    const close = base + BigInt(i) * 100_000_000n;
    return { ...c, open: dec(close), close: dec(close), high: dec(close + 3_000_000_000n), low: dec(close - 3_000_000_000n) };
  });
  expect(compareExactD(input)[49]).toBe('POSITIVE_THRESHOLD_MET');
});

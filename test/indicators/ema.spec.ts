import { ema } from '../../src/indicators';
import { Candle } from '../../src/simulation/candle';

function candles(values: number[]): Candle[] {
  return values.map((v, i) => ({ asset: 'BTC',
    openTime: new Date(Date.UTC(2026, 0, 1, 0, i * 5)).toISOString(),
    closeTime: new Date(Date.UTC(2026, 0, 1, 0, (i + 1) * 5)).toISOString(),
    open: v.toFixed(8), high: v.toFixed(8), low: v.toFixed(8), close: v.toFixed(8), volume: '0.00000000' }));
}
const now = '2026-01-02T00:00:00.000Z';

test.each([9, 20, 21, 50] as const)('EMA%s starts at N-1 with SMA and then alpha=2/(N+1)', period => {
  const input = candles(Array.from({ length: period + 2 }, (_, i) => i + 1));
  const result = ema(input, now, period);
  expect(result.slice(0, period - 1)).toEqual(Array(period - 1).fill(null));
  expect(result[period - 1]).toBeCloseTo((period + 1) / 2, 12);
  expect(result[period]).toBeCloseTo((period + 3) / 2, 12);
  expect(result[period + 1]).toBeCloseTo((period + 5) / 2, 12);
  expect(ema(input.slice(0, period - 1), now, period)).toEqual(Array(period - 1).fill(null));
});

test('EMA on flat, descending and non-linear data', () => {
  expect(ema(candles(Array(12).fill(7)), now, 9).slice(8)).toEqual([7, 7, 7, 7]);
  expect(ema(candles(Array.from({ length: 11 }, (_, i) => 20 - i)), now, 9).slice(8))
    .toEqual([16, 15, 14]);
  // SMA(1..9)=5; alpha=1/5: 5 -> 8 -> 6.8.
  const nonlinear = ema(candles([1, 2, 3, 4, 5, 6, 7, 8, 9, 20, 2]), now, 9);
  expect(nonlinear[8]).toBeCloseTo(5, 12);
  expect(nonlinear[9]).toBeCloseTo(8, 12);
  expect(nonlinear[10]).toBeCloseTo(6.8, 12);
});

test('unsupported periods are rejected at runtime', () => {
  expect(() => ema([], now, 0 as 9)).toThrow(RangeError);
  expect(() => ema([], now, 14 as 9)).toThrow(RangeError);
});

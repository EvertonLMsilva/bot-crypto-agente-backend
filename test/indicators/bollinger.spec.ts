import { bollinger } from '../../src/indicators';
import { Candle } from '../../src/simulation/candle';

function candles(values: number[]): Candle[] {
  return values.map((v, i) => ({ asset: 'BTC',
    openTime: new Date(Date.UTC(2026, 0, 1, 0, i * 5)).toISOString(),
    closeTime: new Date(Date.UTC(2026, 0, 1, 0, (i + 1) * 5)).toISOString(),
    open: v.toFixed(8), high: v.toFixed(8), low: v.toFixed(8), close: v.toFixed(8), volume: '0.00000000' }));
}
const now = '2026-01-02T00:00:00.000Z';

test('Bollinger20/2 at 19, population variance 33.25 for 1..20', () => {
  const input = candles(Array.from({ length: 21 }, (_, i) => i + 1));
  const result = bollinger(input, now);
  expect(result.slice(0, 19)).toEqual(Array(19).fill(null));
  expect(result[19]!.middle).toBeCloseTo(10.5, 12);
  expect(result[19]!.upper).toBeCloseTo(10.5 + 2 * Math.sqrt(33.25), 12);
  expect(result[19]!.lower).toBeCloseTo(10.5 - 2 * Math.sqrt(33.25), 12);
  expect(result[20]!.middle).toBeCloseTo(11.5, 12);
  expect(result[20]!.upper).toBeCloseTo(11.5 + 2 * Math.sqrt(33.25), 12);
  expect(bollinger(input.slice(0, 19), now)).toEqual(Array(19).fill(null));
});

test('constant and descending series', () => {
  expect(bollinger(candles(Array(22).fill(10)), now).slice(19))
    .toEqual(Array(3).fill({ middle: 10, upper: 10, lower: 10 }));
  expect(bollinger(candles(Array.from({ length: 20 }, (_, i) => 20 - i)), now)[19]!.middle)
    .toBeCloseTo(10.5, 12);
});

import { rsi } from '../../src/indicators';
import { Candle } from '../../src/simulation/candle';

function candles(values: number[]): Candle[] {
  return values.map((v, i) => ({ asset: 'BTC',
    openTime: new Date(Date.UTC(2026, 0, 1, 0, i * 5)).toISOString(),
    closeTime: new Date(Date.UTC(2026, 0, 1, 0, (i + 1) * 5)).toISOString(),
    open: v.toFixed(8), high: v.toFixed(8), low: v.toFixed(8), close: v.toFixed(8), volume: '0.00000000' }));
}
const now = '2026-01-02T00:00:00.000Z';

test.each([['flat', Array(35).fill(10), 50],
  ['up', Array.from({ length: 35 }, (_, i) => i + 1), 100],
  ['down', Array.from({ length: 35 }, (_, i) => 40 - i), 0]] as const)
('RSI %s starts at t=14 and handles zero averages', (_, values, expected) => {
  const result = rsi(candles([...values]), now);
  expect(result.slice(0, 14)).toEqual(Array(14).fill(null));
  expect(result.slice(14)).toEqual(Array(21).fill(expected));
});

test('RSI independent Wilder reference: initial gains 3.34, losses 1.40', () => {
  const values = [44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42,
    45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28, 46.00, 46.03];
  const result = rsi(candles(values), now);
  expect(result[14]).toBeCloseTo(70.46413502109705, 10);
  expect(result[15]).toBeCloseTo(66.24961855355505, 10);
  expect(result[16]).toBeCloseTo(66.48094183471265, 10);
  expect(result.slice(14).every(v => v !== null && v >= 0 && v <= 100)).toBe(true);
  expect(rsi(candles(values.slice(0, 14)), now)).toEqual(Array(14).fill(null));
});

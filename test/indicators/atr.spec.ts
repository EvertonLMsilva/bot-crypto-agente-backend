import { atr } from '../../src/indicators';
import { Candle } from '../../src/simulation/candle';

function candles(values: number[]): Candle[] {
  return values.map((v, i) => ({ asset: 'BTC',
    openTime: new Date(Date.UTC(2026, 0, 1, 0, i * 5)).toISOString(),
    closeTime: new Date(Date.UTC(2026, 0, 1, 0, (i + 1) * 5)).toISOString(),
    open: v.toFixed(8), high: (v + 1).toFixed(8), low: (v - 1).toFixed(8), close: v.toFixed(8), volume: '0.00000000' }));
}
const now = '2026-01-02T00:00:00.000Z';

test('ATR seeds from TR[1..14], excludes t=0, and uses Wilder through gaps', () => {
  const input = candles([...Array(15).fill(10), 20, 5]);
  input[0] = { ...input[0]!, high: '100.00000000', low: '1.00000000' };
  const result = atr(input, now);
  expect(result.slice(0, 14)).toEqual(Array(14).fill(null));
  expect(result[14]).toBeCloseTo(2, 12);
  expect(result[15]).toBeCloseTo(37 / 14, 12);
  expect(result[16]).toBeCloseTo(705 / 196, 12);
  expect(atr(input.slice(0, 14), now)).toEqual(Array(14).fill(null));
});

test('ATR zero is explicit; constant range and directional series stay finite', () => {
  const flat = candles(Array(30).fill(10)).map(c => ({ ...c, high: c.close, low: c.close }));
  expect(atr(flat, now).slice(14)).toEqual(Array(16).fill(0));
  for (const values of [Array(30).fill(10), Array.from({ length: 30 }, (_, i) => i + 2),
    Array.from({ length: 30 }, (_, i) => 40 - i)]) {
    for (const value of atr(candles(values), now).slice(14)) expect(value).toBeCloseTo(2, 12);
  }
});

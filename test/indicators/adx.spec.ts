import { adx } from '../../src/indicators';
import { Candle } from '../../src/simulation/candle';

function candles(values: number[]): Candle[] {
  return values.map((v, i) => ({ asset: 'BTC',
    openTime: new Date(Date.UTC(2026, 0, 1, 0, i * 5)).toISOString(),
    closeTime: new Date(Date.UTC(2026, 0, 1, 0, (i + 1) * 5)).toISOString(),
    open: v.toFixed(8), high: (v + 1).toFixed(8), low: (v - 1).toFixed(8), close: v.toFixed(8), volume: '0.00000000' }));
}
const now = '2026-01-02T00:00:00.000Z';

test.each([1, -1])('DI at 14; ADX at 27 on directional series %s', direction => {
  const result = adx(candles(Array.from({ length: 30 }, (_, i) => 40 + direction * i)), now);
  expect(result.slice(0, 14)).toEqual(Array(14).fill(null));
  for (const value of result.slice(14)) {
    expect(value!.plusDI).toBeCloseTo(direction === 1 ? 50 : 0, 12);
    expect(value!.minusDI).toBeCloseTo(direction === -1 ? 50 : 0, 12);
    expect(value!.dx).toBeCloseTo(100, 12);
  }
  expect(result.slice(14, 27).every(value => value!.adx === null)).toBe(true);
  expect(result[27]!.adx).toBeCloseTo(100, 12);
  expect(result[28]!.adx).toBeCloseTo(100, 12);
});

test('zero TR and zero directional sum produce DI/DX zero without invalid division', () => {
  for (const zeroRange of [false, true]) {
    const input = candles(Array(30).fill(10)).map(c => zeroRange ? { ...c, high: c.close, low: c.close } : c);
    const result = adx(input, now);
    expect(result[14]).toEqual({ plusDI: 0, minusDI: 0, dx: 0, adx: null });
    expect(result[27]).toEqual({ plusDI: 0, minusDI: 0, dx: 0, adx: 0 });
  }
});

test('equal positive directional movements both count as zero', () => {
  const input = candles(Array(30).fill(100)).map((c, i) => ({ ...c,
    high: (101 + i).toFixed(8), low: (99 - i).toFixed(8) }));
  expect(adx(input, now)[27]).toEqual({ plusDI: 0, minusDI: 0, dx: 0, adx: 0 });
});

test('independent rational Wilder reference for mixed movements and ADX recurrence', () => {
  const input = candles(Array.from({ length: 30 }, (_, i) => 100 + i)).map((c, i) => ({ ...c,
    high: (100 + i + [3, 5, 2, 4][i % 4]!).toFixed(8),
    low: (100 + i - [2, 1, 4, 3][i % 4]!).toFixed(8) }));
  // Independently computed with exact Fraction arithmetic over TR/DM sums.
  const reference = [
    [14, 25, 9.523809523809524, 44.827586206896555, null],
    [15, 26.470588235294116, 8.739495798319327, 50.35799522673031, null],
    [27, 26.010268246470677, 8.621698690614329, 50.209592736807906, 49.80250270053939],
    [28, 24.45846574243568, 8.107318235543628, 50.209592736807906, 49.83158056027286],
    [29, 26.286769177817323, 7.526983568397045, 55.479750355483795, 50.23502125993078],
  ] as const;
  const result = adx(input, now);
  for (const [index, plus, minus, dx, expectedADX] of reference) {
    expect(result[index]!.plusDI).toBeCloseTo(plus, 10);
    expect(result[index]!.minusDI).toBeCloseTo(minus, 10);
    expect(result[index]!.dx).toBeCloseTo(dx, 10);
    if (expectedADX === null) expect(result[index]!.adx).toBeNull();
    else expect(result[index]!.adx).toBeCloseTo(expectedADX, 10);
  }
});

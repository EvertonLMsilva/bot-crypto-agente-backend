import { classifyHourly } from '../../src/regimes';
import { classifyRegime, DirectionalEvidence } from '../../src/regimes/classify-hourly';
import { Candle, toDecimalString as dec } from '../../src/simulation/candle';
import { ExactDComparison } from '../../src/regimes/types';

function market(hours: number, direction = 1n): Candle[] {
  return Array.from({ length: hours * 12 }, (_, i) => {
    const hour = BigInt(Math.floor(i / 12)), close = 6_000_000_000_000n + direction * hour * 10_000_000n;
    return { asset: 'BTC', openTime: new Date(Date.UTC(2026, 0, 1) + i * 300_000).toISOString(),
      closeTime: new Date(Date.UTC(2026, 0, 1) + (i + 1) * 300_000).toISOString(),
      open: dec(close), close: dec(close), high: dec(close + 300_000_000n), low: dec(close - 300_000_000n), volume: '1.00000000' };
  });
}
const asOf = (input: readonly Candle[]): string => input.at(-1)?.closeTime ?? '2026-01-01T00:00:00.000Z';

test.each([[1n, 'UPTREND'], [-1n, 'DOWNTREND'], [0n, 'SIDEWAYS']] as const)
('known series %s: raw at49, confirmation only at50', (direction, regime) => {
  const input = market(53, direction), result = classifyHourly(input, asOf(input));
  expect(result.slice(0, 49).every(p => p.rawRegime === 'UNKNOWN' && p.confirmedRegime === 'UNKNOWN')).toBe(true);
  expect(result[49]!.rawRegime).toBe(regime);
  expect(result[49]!.confirmedRegime).toBe('UNKNOWN');
  expect(result[50]!.confirmedRegime).toBe(regime);
  expect(result[50]!.warmupComplete).toBe(false);
  if (direction === 1n) {
    expect(result[49]!.d).toBeLessThan(0.25);
    expect(result[49]!.exactD).toBe('POSITIVE_THRESHOLD_MET');
  }
});

const point = (v: number) => ({ lower: v, upper: v });
function evidence(adx: number, plus = 10, minus = 1): DirectionalEvidence {
  return { adx: point(adx), plus: point(plus), minus: point(minus) };
}
test.each([
  [19.999999999, 'POSITIVE_THRESHOLD_MET', 10, 1, 'SIDEWAYS'],
  [20, 'POSITIVE_THRESHOLD_MET', 10, 1, 'UNKNOWN'],
  [24.999999999, 'POSITIVE_THRESHOLD_MET', 10, 1, 'UNKNOWN'],
  [25, 'POSITIVE_THRESHOLD_MET', 10, 1, 'UPTREND'],
  [25.000000001, 'POSITIVE_THRESHOLD_MET', 10, 1, 'UPTREND'],
  [25, 'NEGATIVE_THRESHOLD_MET', 1, 10, 'DOWNTREND'],
  [25, 'POSITIVE_THRESHOLD_MET', 1, 10, 'UNKNOWN'],
  [25, 'NEGATIVE_THRESHOLD_MET', 10, 1, 'UNKNOWN'],
  [25, 'POSITIVE_THRESHOLD_MET', 1, 1, 'UNKNOWN'],
  [100, 'BETWEEN_THRESHOLDS', 10, 1, 'UNKNOWN'],
  [0, 'UNAVAILABLE', 0, 0, 'UNKNOWN'],
] as const)('boundary ADX=%s D=%s DI=%s/%s -> %s', (adx, d, plus, minus, expected) => {
  expect(classifyRegime(d, evidence(adx, plus, minus))).toBe(expected);
});

test('uncertain ADX or directional comparisons fail conservatively without epsilon', () => {
  for (const adx of [{ lower: 19.999999999, upper: 20.000000001 }, { lower: 24.999999999, upper: 25.000000001 }]) {
    expect(classifyRegime('POSITIVE_THRESHOLD_MET', { ...evidence(25), adx })).toBe('UNKNOWN');
  }
  expect(classifyRegime('POSITIVE_THRESHOLD_MET', { ...evidence(25), plus: { lower: 0.9, upper: 1.1 } })).toBe('UNKNOWN');
  expect(classifyRegime('POSITIVE_THRESHOLD_MET', null)).toBe('UNKNOWN');
  expect(classifyRegime('POSITIVE_THRESHOLD_MET', evidence(Infinity))).toBe('UNKNOWN');
});

test.each([[5n, 3n, 25], [3n, 2n, 20]] as const)
('end-to-end exact DX/ADX boundary from DM totals %s/%s is conservative', (gain, loss, expected) => {
  // Two initial directional movements, then DM=0. Their Wilder ratio stays
  // gain/loss forever: DX=100*(gain-loss)/(gain+loss), hence ADX=25 or20.
  const input = market(50).map((c, i) => {
    const h = Math.floor(i / 12), close = 5_995_500_000_000n + BigInt(h) * 190_000_000n;
    const high = 6_005_000_000_000n - (h === 0 ? gain * 100_000_000n : 0n);
    const low = 5_995_000_000_000n + (h < 2 ? loss * 100_000_000n : 0n);
    return { ...c, open: dec(close), close: dec(close), high: dec(high), low: dec(low) };
  });
  const last = classifyHourly(input, asOf(input))[49]!;
  expect(last.exactD).toBe('POSITIVE_THRESHOLD_MET');
  expect(last.adx14).toBeCloseTo(expected, 10);
  expect(last.rawRegime).toBe('UNKNOWN');
  expect(last.reason).toBe('INTERMEDIATE_CONTRADICTORY_OR_NUMERICALLY_UNCERTAIN');
});

test('zero ATR never enables D, volatility or a regime; warmup is only informational', () => {
  const input = market(150, 0n).map(c => ({ ...c, high: c.close, low: c.close }));
  const result = classifyHourly(input, asOf(input));
  expect(result.every(p => p.rawRegime === 'UNKNOWN' && p.confirmedRegime === 'UNKNOWN' && p.d === null && p.volatility === 'UNKNOWN')).toBe(true);
  expect(result[149]!.warmupComplete).toBe(true);
});

test('a new regime interrupts confirmation, instead of preserving an old authorization', () => {
  const input = market(150).map((c, i) => {
    const h = Math.floor(i / 12);
    if (h < 60) return c;
    // A steeper decline moves D strictly past -0.25 rather than only
    // approaching that threshold asymptotically after the reversal.
    const close = 6_000_000_000_000n + BigInt(180 - 2 * h) * 10_000_000n;
    return { ...c, open: dec(close), close: dec(close), high: dec(close + 300_000_000n), low: dec(close - 300_000_000n) };
  });
  const result = classifyHourly(input, asOf(input));
  const firstDown = result.findIndex(p => p.rawRegime === 'DOWNTREND');
  expect(firstDown).toBeGreaterThan(60);
  expect(result[firstDown]!.confirmedRegime).toBe('UNKNOWN');
  expect(result[firstDown + 1]!.confirmedRegime).toBe('DOWNTREND');
  for (const p of result.filter(p => p.rawRegime === 'UNKNOWN')) expect(p.confirmedRegime).toBe('UNKNOWN');
});

test.each([[0n, 'NORMAL'], [1n, 'HIGH'], [-1n, 'NORMAL']] as const)
('volatility equality / adjacent exact tick %s: first eligible index114 -> %s', (change, expected) => {
  const input = market(115, 0n).map((c, i) => i >= 114 * 12
    ? { ...c, high: dec(6_000_300_000_000n + change) } : c);
  const result = classifyHourly(input, asOf(input));
  expect(result.slice(0, 114).every(p => p.volatility === 'UNKNOWN')).toBe(true);
  expect(result[114]!.volatility).toBe(expected);
  expect(result[114]!.volatilityP75).toBeCloseTo(0.0001, 15);
});

test('nearest rank75 of previous100 excludes current: monotonic ATR reference at t=88', () => {
  const input = market(115, 0n).map((c, i) => {
    const halfRange = BigInt(Math.floor(i / 12) + 1) * 50_000_000n;
    const close = 100_000_000_000n;
    return { ...c, open: dec(close), close: dec(close), high: dec(close + halfRange), low: dec(close - halfRange) };
  });
  const result = classifyHourly(input, asOf(input));
  // TR[t]=t+1; ATR[t]=t-12+6.5*(13/14)^(t-14), t>=14.
  expect(result[114]!.volatilityP75).toBeCloseTo((76 + 6.5 * (13 / 14) ** 74) / 1000, 12);
  expect(result[114]!.volatility).toBe('HIGH');
});

test('warmup149/150, prefix invariance, partial suffix, determinism and asset isolation', () => {
  const input = Object.freeze(market(150).map(c => Object.freeze(c))), before = JSON.stringify(input);
  const wall = jest.spyOn(Date, 'now').mockImplementation(() => { throw new Error('wall'); });
  const random = jest.spyOn(Math, 'random').mockImplementation(() => { throw new Error('random'); });
  try {
    const all = classifyHourly(input, asOf(input));
    expect(Object.isFrozen(all)).toBe(true); expect(Object.isFrozen(all[149])).toBe(true);
    expect(all[148]!.warmupComplete).toBe(false); expect(all[149]!.warmupComplete).toBe(true);
    for (const size of [0, 11, 12, 13, 49 * 12, 50 * 12, 114 * 12, 149 * 12]) {
      const prefix = input.slice(0, size);
      expect(classifyHourly(prefix, asOf(prefix))).toEqual(all.slice(0, Math.floor(size / 12)));
    }
    const eth = input.map(c => ({ ...c, asset: 'ETH' as const }));
    expect(classifyHourly(eth, asOf(eth))).toEqual(all);
    expect(classifyHourly(input, asOf(input))).toEqual(all);
    expect(Object.keys(all[149]!)).not.toContain('scenario');
    expect(JSON.stringify(input)).toBe(before);
  } finally { wall.mockRestore(); random.mockRestore(); }
});

test('structural errors reject without returning stale classifications or warmup', () => {
  const input = market(150);
  expect(() => classifyHourly([...input.slice(0, 100), ...input.slice(101)], asOf(input))).toThrow(RangeError);
  expect(() => classifyHourly(input, input.at(-2)!.closeTime)).toThrow(RangeError);
  expect(() => classifyHourly([{ ...input[0]!, close: 'NaN' }], asOf(input))).toThrow(RangeError);
});

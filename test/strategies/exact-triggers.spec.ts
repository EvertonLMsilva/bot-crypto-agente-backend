import { exactTriggers } from '../../src/strategies/exact-triggers';
import { Candle, toDecimalString as dec } from '../../src/simulation/candle';

function candles(prices: readonly bigint[], volume = 100n * 100_000_000n): Candle[] {
  return prices.map((close, i) => ({ asset: 'BTC',
    openTime: new Date(Date.UTC(2026, 0, 1) + i * 300_000).toISOString(),
    closeTime: new Date(Date.UTC(2026, 0, 1) + (i + 1) * 300_000).toISOString(),
    open: dec(close), close: dec(close), high: dec(close + 100_000_000n), low: dec(close - 100_000_000n), volume: dec(volume) }));
}
const base = 100n * 100_000_000n;

test.each([[-1n, false], [0n, false], [1n, true]] as const)('TREND after previous equality: tick %s -> %s', (tick, expected) => {
  const input = candles([...Array<bigint>(9).fill(base), base + tick]);
  const result = exactTriggers(input);
  expect(result.slice(0, 9).every(p => p.trend === null)).toBe(true);
  expect(result[9]!.trend).toBe(expected);
  expect(result[8]!.trendRelation).toBe(0);
});

test('TREND requires an actual recovery, not a continuous rise; rational EMA handles one tick', () => {
  const input = candles([...Array<bigint>(9).fill(base), base + 1n, base + 2n]);
  expect(exactTriggers(input)[10]!.trend).toBe(false);
  const recovery = candles([...Array<bigint>(9).fill(base), base - 10n, base]);
  expect(exactTriggers(recovery)[10]!.trend).toBe(true);
});

test.each([[0n, 1n, false], [1n, 0n, false], [1n, 1n, true], [-1n, 1n, false]] as const)
('BREAKOUT strict price tick %s and volume tick %s -> %s', (priceTick, volumeTick, expected) => {
  const input = candles([...Array<bigint>(20).fill(base), base + 100_000_000n + priceTick]);
  input[20] = { ...input[20]!, volume: dec(120n * 100_000_000n + volumeTick), high: '999.00000000' };
  const result = exactTriggers(input);
  expect(result[19]!.breakout).toBeNull();
  expect(result[20]!.breakout).toBe(expected);
  expect(result[20]!.previousHigh).toBe(base + 100_000_000n);
  expect(result[20]!.previousVolumeSum).toBe(2000n * 100_000_000n);
});

test('BREAKOUT zero reference volume does not enable a trigger', () => {
  const input = candles([...Array<bigint>(20).fill(base), base + 200_000_000n], 0n);
  expect(exactTriggers(input)[20]!.breakout).toBe(false);
});

test('RSI35 exact boundary and adjacent ticks, independent gain/loss seed ratio7/13', () => {
  for (const tick of [-1n, 0n, 1n]) {
    // First14 changes: +7, -13, then0 -> Wilder RSI=35 at14.
    const prices = [base, base + 700_000_000n, ...Array<bigint>(13).fill(base - 600_000_000n)];
    prices[1] = prices[1]! + tick;
    const last = exactTriggers(candles(prices))[14]!;
    expect(last.rsi35).toBe(tick < 0n ? -1 : tick > 0n ? 1 : 0);
  }
});

test('MEAN_REVERSION independently known oversold RSI and Bollinger recovery', () => {
  const input = candles([...Array<bigint>(25).fill(base), base - 2_000_000_000n, base - 2_000_000_000n, base]);
  const result = exactTriggers(input);
  expect(result[26]!.rsi35).toBe(-1);
  expect(result[26]!.bandPosition).toBe('BELOW');
  expect(result[27]!.rsi35).toBe(1);
  expect(result[27]!.bandPosition).toBe('WITHIN');
  expect(result[27]!.meanReversion).toBe(true);
  expect(exactTriggers(candles(Array<bigint>(30).fill(base)))[29]!.meanReversion).toBe(false);
  const noReturn = candles([...Array<bigint>(25).fill(base), ...Array<bigint>(3).fill(base - 2_000_000_000n)]);
  expect(exactTriggers(noReturn)[27]!.meanReversion).toBe(false);
  const aboveBand = candles([...Array<bigint>(25).fill(base), base - 2_000_000_000n, base - 2_000_000_000n, base * 2n]);
  expect(exactTriggers(aboveBand)[27]!.meanReversion).toBe(false);
  expect(result[19]!.meanReversion).toBeNull();
});

test.each([[-1n, false], [0n, false], [1n, true]] as const)
('MEAN_REVERSION at RSI35 after loss14 and gain7, recovery tick %s -> %s', (tick, expected) => {
  const input = candles([...Array<bigint>(25).fill(base), base - 1_400_000_000n, base - 700_000_000n + tick]);
  const last = exactTriggers(input)[26]!;
  expect(last.bandPosition).toBe('WITHIN');
  expect(last.rsi35).toBe(tick < 0n ? -1 : tick > 0n ? 1 : 0);
  expect(last.meanReversion).toBe(expected);
});

test.each([[-1n, 'BELOW'], [0n, 'WITHIN'], [1n, 'WITHIN']] as const)
('Bollinger lower boundary: 16 prices100, four prices80; last tick %s -> %s', (tick, expected) => {
  // Mean96, population variance64, lower80 when tick=0. Adjacent tick
  // perturbs the window too; exact squared comparison preserves the side.
  const prices = [...Array<bigint>(16).fill(base), ...Array<bigint>(3).fill(base - 2_000_000_000n), base - 2_000_000_000n + tick];
  expect(exactTriggers(candles(prices))[19]!.bandPosition).toBe(expected);
});

test('upper-band boundary and outside position, without square-root rounding', () => {
  const within = [...Array<bigint>(16).fill(base), ...Array<bigint>(4).fill(base + 2_000_000_000n)];
  expect(exactTriggers(candles(within))[19]!.bandPosition).toBe('WITHIN');
  within[19] = within[19]! + 1n;
  expect(exactTriggers(candles(within))[19]!.bandPosition).toBe('ABOVE');
});

test('causal prefixes, exact volumes, immutable inputs and BTC/ETH independence', () => {
  const input = Object.freeze(candles(Array.from({ length: 50 }, (_, i) => base + BigInt(i))).map(c => Object.freeze(c)));
  const before = JSON.stringify(input), all = exactTriggers(input);
  for (const size of [0, 9, 14, 20, 21, 35]) expect(exactTriggers(input.slice(0, size))).toEqual(all.slice(0, size));
  expect(exactTriggers(input.map(c => ({ ...c, asset: 'ETH' })))).toEqual(all);
  expect(Object.isFrozen(all)).toBe(true); expect(Object.isFrozen(all[49])).toBe(true);
  expect(JSON.stringify(input)).toBe(before);
});

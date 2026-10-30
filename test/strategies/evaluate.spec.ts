import { evaluateTechnicalStrategies } from '../../src/strategies';
import { Candle, toDecimalString as dec } from '../../src/simulation/candle';
import * as regimes from '../../src/regimes/classify-hourly';
import * as bollingerModule from '../../src/indicators/bollinger';
import * as emaModule from '../../src/indicators/ema';
import { HourlyClassification, MarketRegime, VolatilityRegime } from '../../src/regimes';

const base = 10_000_000_000n;
function candle(close: bigint, i: number, volume = 10_000_000_000n): Candle {
  return { asset: 'BTC', openTime: new Date(Date.UTC(2026, 0, 1) + i * 300_000).toISOString(),
    closeTime: new Date(Date.UTC(2026, 0, 1) + (i + 1) * 300_000).toISOString(), open: dec(close), close: dec(close),
    high: dec(close + 300_000_000n), low: dec(close - 300_000_000n), volume: dec(volume) };
}
function market(hours = 150, direction = 0n): Candle[] {
  return Array.from({ length: hours * 12 }, (_, i) => candle(base + direction * BigInt(Math.floor(i / 12)) * 10_000_000n, i));
}
const asOf = (input: readonly Candle[]) => input.at(-1)!.closeTime;
function recovery(hours = 150): Candle[] {
  const input = market(hours);
  for (const price of [base - 2_000_000_000n, base - 2_000_000_000n, base]) input.push(candle(price, input.length));
  return input;
}
function context(regime: MarketRegime = 'SIDEWAYS', warmup = true, volatility: VolatilityRegime = 'NORMAL'): HourlyClassification {
  return { closeTime: '2026-01-07T06:00:00.000Z', rawRegime: regime, confirmedRegime: regime, volatility,
    warmupComplete: warmup, ema20: 100, ema50: 100, atr14: 6, adx14: 0, plusDI: 0, minusDI: 0,
    d: 0, exactD: 'BETWEEN_THRESHOLDS', volatilityRatio: 0.06, volatilityP75: 0.06, reason: null };
}
afterEach(() => jest.restoreAllMocks());

test('three fixed families; last snapshot only, no order or global score fields', () => {
  const input = recovery(), output = evaluateTechnicalStrategies(input, asOf(input));
  expect(output.map(p => p.family)).toEqual(['TREND', 'BREAKOUT', 'MEAN_REVERSION']);
  expect(output.every(p => p.asset === 'BTC' && p.closeTime === asOf(input))).toBe(true);
  expect(output[2]).toMatchObject({ triggerMet: true, G: 1, technicalEligible: true, reason: 'TECHNICALLY_ELIGIBLE',
    confirmedRegime: 'SIDEWAYS', warmupComplete: true, regimeCloseTime: '2026-01-07T06:00:00.000Z' });
  expect(output[2]!.T).toBeGreaterThan(0); expect(output[2]!.T).toBeLessThanOrEqual(100);
  expect(Object.keys(output[0]!)).not.toContain('score'); expect(Object.keys(output[0]!)).not.toContain('order');
  expect(Object.isFrozen(output)).toBe(true); expect(Object.isFrozen(output[2])).toBe(true);
});

test('real UPTREND recovery and BREAKOUT can be technically eligible with T<60', () => {
  const input = market(150, 1n), lastPrice = base + 149n * 10_000_000n;
  const trend = [...input, candle(lastPrice - 1_000_000_000n, input.length), candle(lastPrice + 30_000_000n, input.length + 1, 12_500_000_000n)];
  const result = evaluateTechnicalStrategies(trend, asOf(trend))[0]!;
  expect(result).toMatchObject({ confirmedRegime: 'UPTREND', G: 1, technicalEligible: true, F: 0 });
  expect(result.T).toBeLessThan(60);
  const breakout = [...input, candle(lastPrice + 300_000_001n, input.length, 12_000_000_001n)];
  const assessment = evaluateTechnicalStrategies(breakout, asOf(breakout))[1]!;
  expect(assessment).toMatchObject({ G: 1, technicalEligible: true });
  expect(assessment.T).toBeLessThan(60);
});

test('149h blocks a real recovery; 150h completes the informational warmup', () => {
  for (const hours of [149, 150]) {
    const input = recovery(hours), result = evaluateTechnicalStrategies(input, asOf(input))[2]!;
    expect(result.G).toBe(1);
    expect(result.technicalEligible).toBe(hours === 150);
    expect(result.reason).toBe(hours === 150 ? 'TECHNICALLY_ELIGIBLE' : 'WARMUP_INCOMPLETE');
  }
});

test.each(['UPTREND', 'DOWNTREND', 'UNKNOWN'] as const)('incompatible %s does not enable a mean recovery', regime => {
  jest.spyOn(regimes, 'classifyHourly').mockReturnValue([context(regime)]);
  const input = recovery(), result = evaluateTechnicalStrategies(input, asOf(input))[2]!;
  expect(result).toMatchObject({ G: 1, technicalEligible: false, reason: 'REGIME_INCOMPATIBLE' });
});

test('unknown volatility, missing hours, and no trigger have explicit reasons', () => {
  const input = recovery();
  const spy = jest.spyOn(regimes, 'classifyHourly').mockReturnValue([context('SIDEWAYS', true, 'UNKNOWN')]);
  expect(evaluateTechnicalStrategies(input, asOf(input))[2]).toMatchObject({ technicalEligible: false, reason: 'VOLATILITY_UNKNOWN' });
  spy.mockReturnValue([]);
  expect(evaluateTechnicalStrategies(input, asOf(input))[2]).toMatchObject({ reason: 'NO_CLOSED_HOUR', regimeCloseTime: null });
  spy.mockReturnValue([context()]);
  const flat = market();
  expect(evaluateTechnicalStrategies(flat, asOf(flat))[2]).toMatchObject({ G: 0, technicalEligible: false, reason: 'TRIGGER_NOT_MET' });
  expect(evaluateTechnicalStrategies(flat, asOf(flat))[2]!.T).not.toBeNull();
});

test('invalid indicators/divisors never become substituted evidence', () => {
  const input = recovery();
  jest.spyOn(bollingerModule, 'bollinger').mockImplementation(() => { throw new RangeError('statistical overflow'); });
  expect(evaluateTechnicalStrategies(input, asOf(input))[2]).toMatchObject({ G: 1, F: null, T: null,
    technicalEligible: false, reason: 'INDICATORS_UNAVAILABLE' });
  const zeroVolume = input.map(c => ({ ...c, volume: '0.00000000' }));
  expect(evaluateTechnicalStrategies(zeroVolume, asOf(zeroVolume))[2]).toMatchObject({ V: null, T: null, technicalEligible: false });
});

test('unexpected implementation errors propagate rather than becoming unavailable data', () => {
  const input = recovery();
  jest.spyOn(emaModule, 'ema').mockImplementation(() => { throw new Error('unexpected'); });
  expect(() => evaluateTechnicalStrategies(input, asOf(input))).toThrow('unexpected');
});

test('one classifyHourly call, no future/hour in formation, snapshot timestamp must match', () => {
  const input = recovery(), spy = jest.spyOn(regimes, 'classifyHourly');
  const out = evaluateTechnicalStrategies(input, asOf(input));
  expect(spy).toHaveBeenCalledTimes(1);
  expect(Date.parse(out[2]!.regimeCloseTime!)).toBeLessThan(Date.parse(asOf(input)));
  const stale = new Date(Date.parse(asOf(input)) + 300_000).toISOString();
  expect(() => evaluateTechnicalStrategies(input, stale)).toThrow(RangeError);
  expect(() => evaluateTechnicalStrategies(input, input.at(-2)!.closeTime)).toThrow(RangeError);
  expect(() => evaluateTechnicalStrategies([], asOf(input))).toThrow(RangeError);
  expect(() => evaluateTechnicalStrategies([input[0]!, input[0]!], asOf(input))).toThrow(RangeError);
});

test('prefix snapshot is stable, inputs immutable, no wall clock/random or BTC/ETH state', () => {
  const input = Object.freeze(recovery().map(c => Object.freeze(c))), before = JSON.stringify(input);
  const wall = jest.spyOn(Date, 'now').mockImplementation(() => { throw new Error('wall'); });
  const random = jest.spyOn(Math, 'random').mockImplementation(() => { throw new Error('random'); });
  try {
    const first = evaluateTechnicalStrategies(input, asOf(input));
    const extended = [...input, candle(base + 100_000_000n, input.length)];
    evaluateTechnicalStrategies(extended, asOf(extended));
    expect(evaluateTechnicalStrategies(extended.slice(0, input.length), asOf(input))).toEqual(first);
    const eth = input.map(c => ({ ...c, asset: 'ETH' as const }));
    expect(evaluateTechnicalStrategies(eth, asOf(eth))).toEqual(first.map(p => ({ ...p, asset: 'ETH' })));
    expect(evaluateTechnicalStrategies(input, asOf(input))).toEqual(first);
    expect(JSON.stringify(input)).toBe(before);
  } finally { wall.mockRestore(); random.mockRestore(); }
});

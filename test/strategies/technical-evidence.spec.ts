import { technicalEvidence, TechnicalInput } from '../../src/strategies/technical-evidence';

function frame(): TechnicalInput {
  return { family: 'TREND', G: 1, candle: { asset: 'BTC', openTime: '2026-01-01T00:00:00.000Z', closeTime: '2026-01-01T00:05:00.000Z',
    open: '11.00000000', high: '14.00000000', low: '10.00000000', close: '12.00000000', volume: '125.00000000' },
    ema9: 12, ema21: 11, atr14: 4, minimumPreviousRSI: 20,
    previousHigh: 1_000_000_000n, previousVolumeSum: 200_000_000_000n };
}

test.each([['TREND', 0.5, 70], ['BREAKOUT', 1, 85], ['MEAN_REVERSION', 1, 85]] as const)
('%s known components F=%s, Q=0.5,V=0.5,T=%s', (family, F, T) => {
  expect(technicalEvidence({ ...frame(), family })).toEqual({ F, Q: 0.5, V: 0.5, T, reason: 'OK' });
});

test('G=0 still computes unrounded technical evidence', () => {
  expect(technicalEvidence({ ...frame(), G: 0 }).T).toBe(30);
  const result = technicalEvidence({ ...frame(), ema9: 11 + 1 / 3 });
  expect(result.T).toBeGreaterThan(59.99); expect(result.T).toBeLessThan(60.01);
  expect(Number.isInteger(result.T)).toBe(false);
});

test.each([['10.00000000', 0, 60], ['14.00000000', 1, 80]] as const)('Q at close %s -> %s, T=%s', (close, Q, T) => {
  const f = frame();
  expect(technicalEvidence({ ...f, candle: { ...f.candle, close } })).toMatchObject({ Q, T });
});

test.each([['0.00000000', 0, 65], ['100.00000000', 0, 65], ['150.00000000', 1, 75]] as const)
('volume %s -> V=%s,T=%s', (volume, V, T) => {
  const f = frame(); expect(technicalEvidence({ ...f, candle: { ...f.candle, volume } })).toMatchObject({ V, T });
});

test.each([
  [{ atr14: 0 }, 'ATR_NOT_POSITIVE'], [{ atr14: null }, 'INDICATORS_UNAVAILABLE'],
  [{ atr14: Infinity }, 'INVALID_COMPONENT'], [{ ema9: NaN }, 'INVALID_COMPONENT'],
  [{ ema21: null }, 'INDICATORS_UNAVAILABLE'], [{ previousVolumeSum: 0n }, 'VOLUME_AVERAGE_NOT_POSITIVE'],
  [{ previousVolumeSum: null }, 'INDICATORS_UNAVAILABLE'],
] as const)('invalid or unavailable inputs %j produce explicit null T', (patch, reason) => {
  const result = technicalEvidence({ ...frame(), ...patch });
  expect(result.T).toBeNull(); expect(result.reason).toBe(reason);
  expect(Object.values(result).some(v => typeof v === 'number' && !Number.isFinite(v))).toBe(false);
});

test('flat price range, missing breakout reference and missing/invalid RSI do not invent components', () => {
  const f = frame();
  expect(technicalEvidence({ ...f, candle: { ...f.candle, high: '12.00000000', low: '12.00000000' } }))
    .toMatchObject({ Q: null, T: null, reason: 'PRICE_RANGE_NOT_POSITIVE' });
  expect(technicalEvidence({ ...f, family: 'BREAKOUT', previousHigh: null })).toMatchObject({ F: null, T: null, reason: 'INDICATORS_UNAVAILABLE' });
  expect(technicalEvidence({ ...f, family: 'MEAN_REVERSION', minimumPreviousRSI: null })).toMatchObject({ F: null, T: null });
  expect(technicalEvidence({ ...f, family: 'MEAN_REVERSION', minimumPreviousRSI: -1 })).toMatchObject({ F: null, T: null, reason: 'INVALID_COMPONENT' });
});

test('F clips negative/large values; T endpoints and no input mutation', () => {
  const f = frame(), before = JSON.stringify(f.candle);
  expect(technicalEvidence({ ...f, ema9: 10 }).F).toBe(0);
  expect(technicalEvidence({ ...f, ema9: 20 }).F).toBe(1);
  expect(technicalEvidence({ ...f, family: 'BREAKOUT', previousHigh: 2_000_000_000n }).F).toBe(0);
  expect(technicalEvidence({ ...f, family: 'MEAN_REVERSION', minimumPreviousRSI: 50 }).F).toBe(0);
  expect(technicalEvidence({ ...f, ema9: 20, candle: { ...f.candle, close: f.candle.high, volume: '150.00000000' } }).T).toBe(100);
  expect(technicalEvidence({ ...f, G: 0, ema9: 10, candle: { ...f.candle, close: f.candle.low, volume: '0.00000000' } }).T).toBe(0);
  expect(JSON.stringify(f.candle)).toBe(before);
});

test('exact large volume ratios and small tick Q remain finite without intermediate Number overflow', () => {
  const f = frame(), previous = 10n ** 316n;
  expect(technicalEvidence({ ...f, previousVolumeSum: 20n * previous,
    candle: { ...f.candle, volume: '150' + '0'.repeat(306) + '.00000000' } }).V).toBe(1);
  expect(technicalEvidence({ ...f, candle: { ...f.candle, close: '10.00000001' } }).Q).toBeCloseTo(0.0000000025, 18);
});

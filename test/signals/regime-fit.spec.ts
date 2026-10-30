import { regimeFit } from '../../src/signals/regime-fit';

test.each([
  ['UPTREND','TREND','NORMAL',100], ['UPTREND','TREND','HIGH',80],
  ['UPTREND','BREAKOUT','NORMAL',90], ['UPTREND','BREAKOUT','HIGH',80],
  ['SIDEWAYS','BREAKOUT','NORMAL',80], ['SIDEWAYS','BREAKOUT','HIGH',60],
  ['SIDEWAYS','MEAN_REVERSION','NORMAL',100], ['SIDEWAYS','MEAN_REVERSION','HIGH',60],
] as const)('%s/%s/%s -> R=%s', (regime, family, volatility, R) => {
  expect(regimeFit(regime, family, volatility)).toEqual({ eligible:true, R, reasons:[] });
});
test.each(['DOWNTREND','UNKNOWN'] as const)('%s is ineligible, never R0', regime => {
  const result = regimeFit(regime, 'TREND', 'NORMAL');
  expect(result.eligible).toBe(false); expect(result.R).toBeNull(); expect(result.reasons.length).toBeGreaterThan(0);
});
test('unknown volatility and incompatible families preserve explicit reasons', () => {
  expect(regimeFit('UNKNOWN','TREND','UNKNOWN').reasons).toHaveLength(2);
  expect(regimeFit('UPTREND','MEAN_REVERSION','NORMAL')).toMatchObject({ eligible:false,R:null });
  expect(regimeFit('SIDEWAYS','TREND','NORMAL')).toMatchObject({ eligible:false,R:null });
});

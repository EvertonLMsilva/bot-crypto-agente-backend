import { ema, rsi, atr, adx, bollinger, validateHistory } from '../../src/indicators';
import { Candle } from '../../src/simulation/candle';
import { SimulationClock } from '../../src/simulation/clock';
import { SeededGenerator } from '../../src/simulation/seeded-generator';

const now = '2026-01-02T00:00:00.000Z';
const consumers = [
  ['ema', (c: readonly Candle[], t: string) => ema(c, t, 9)],
  ['rsi', rsi], ['atr', atr], ['adx', adx], ['bollinger', bollinger],
] as const;

function fixture(): Candle[] {
  const generator = new SeededGenerator(new SimulationClock('2026-01-01T00:00:00.000Z'), { seed: 'indicators' });
  return Array.from({ length: 60 }, () => ({ ...generator.next()[0] }));
}

describe.each(consumers)('%s common contract', (_, calculate) => {
  test('empty/insufficient history is explicit', () => {
    expect(calculate([], now)).toEqual([]);
    expect(calculate(fixture().slice(0, 1), now)).toEqual([null]);
  });

  test('deterministic, isolated BTC/ETH and immutable inputs including frozen arrays', () => {
    const input = Object.freeze(fixture().map(c => Object.freeze(c)));
    const before = JSON.stringify(input);
    const expected = calculate(input, now);
    const eth = input.map(c => ({ ...c, asset: 'ETH' as const, close: c.low }));
    calculate(eth, now);
    expect(calculate(input, now)).toEqual(expected);
    expect(JSON.stringify(input)).toBe(before);
    expect(calculate(input.map(c => ({ ...c, asset: 'ETH' as const })), now)).toEqual(expected);
  });

  test('prefix results never depend on later candles; no wall time/random reads', () => {
    const input = fixture();
    const wall = jest.spyOn(Date, 'now').mockImplementation(() => { throw new Error('wall clock'); });
    const random = jest.spyOn(Math, 'random').mockImplementation(() => { throw new Error('random'); });
    try {
      const all = calculate(input, now);
      for (const size of [1, 9, 14, 15, 19, 20, 27, 28, 50, 59]) {
        expect(calculate(input.slice(0, size), input[size - 1]!.closeTime)).toEqual(all.slice(0, size));
      }
    } finally { wall.mockRestore(); random.mockRestore(); }
  });

  test('future/forming candles, gaps, duplicates, out of order, mixed assets rejected', () => {
    const input = fixture();
    expect(() => calculate(input, input[58]!.closeTime)).toThrow(RangeError);
    expect(() => calculate(input, '2026-01-01T04:57:00.000Z')).toThrow(RangeError);
    expect(() => calculate([...input.slice(0, 10), ...input.slice(11)], now)).toThrow(RangeError);
    expect(() => calculate([input[0]!, input[0]!], now)).toThrow(RangeError);
    expect(() => calculate([input[1]!, input[0]!], now)).toThrow(RangeError);
    expect(() => calculate(input.map((c, i) => i === 10 ? { ...c, asset: 'ETH' } : c), now)).toThrow(RangeError);
    expect(() => calculate([null] as unknown as Candle[], now)).toThrow(RangeError);
  });

  test('bad OHLCV is rejected even in warmup', () => {
    const c = fixture()[0]!;
    for (const patch of [{ high: c.low }, { low: c.high }, { close: '0.00000000' },
      { open: '-1.00000000' }, { volume: '-1.00000000' }, { close: 'NaN' },
      { volume: 'Infinity' }, { close: undefined }, { asset: 'SOL' }]) {
      expect(() => calculate([{ ...c, ...patch }] as Candle[], now)).toThrow(RangeError);
    }
  });
});

test.each(['2026-02-30T00:00:00.000Z', '2026-01-01T00:01:00.000Z',
  '2026-01-01T00:00:01.000Z', '2026-01-01T00:00:00+00:00', 'invalid'])
('reject invalid UTC boundary %s', time => {
  expect(() => validateHistory([], time)).toThrow(RangeError);
  expect(() => validateHistory([{ ...fixture()[0]!, openTime: time }], now)).toThrow(RangeError);
  expect(() => validateHistory([{ ...fixture()[0]!, closeTime: time }], now)).toThrow(RangeError);
});

test('interval duration, calendar, missing data and decimal syntax validation', () => {
  const c = fixture()[0]!;
  expect(() => validateHistory([{ ...c, closeTime: '2026-01-01T00:10:00.000Z' }], now)).toThrow(RangeError);
  const sparse = Array<Candle>(2); sparse[1] = c;
  expect(() => validateHistory(sparse, now)).toThrow(RangeError);
  for (const value of ['1', '01.00000000', '1e3', '1.0000000', ' 1.00000000', '9'.repeat(400) + '.00000000']) {
    expect(() => validateHistory([{ ...c, open: value }], now)).toThrow(RangeError);
    expect(() => validateHistory([{ ...c, volume: value }], now)).toThrow(RangeError);
  }
  expect(() => validateHistory(undefined as unknown as Candle[], now)).toThrow(RangeError);
  expect(() => validateHistory([], undefined as unknown as string)).toThrow(RangeError);
});

test('zero volume, eight-place positive prices and UTC form without milliseconds accepted', () => {
  const c = { ...fixture()[0]!, open: '0.00000001', high: '0.00000001', low: '0.00000001', close: '0.00000001',
    volume: '0.00000000', openTime: '2026-01-01T00:00:00Z', closeTime: '2026-01-01T00:05:00Z' };
  expect(validateHistory([c], '2026-01-01T00:05:00Z')).toHaveLength(1);
});

test('non-finite statistical results are rejected explicitly', () => {
  const input = fixture().slice(0, 20).map((c, i) => {
    const v = (i % 2 === 0 ? '1' + '0'.repeat(200) : '1') + '.00000000';
    return { ...c, open: v, high: v, low: v, close: v };
  });
  expect(() => bollinger(input, now)).toThrow(RangeError);
});

// Prices are constructed exclusively from exact integer ticks, never Number.
function exactCandles(prices: readonly bigint[]): readonly Candle[] {
  const clock = new SimulationClock('2026-01-01T00:00:00.000Z');
  const format = (ticks: bigint): string => `${ticks / 100_000_000n}.${(ticks % 100_000_000n).toString().padStart(8, '0')}`;
  return Object.freeze(prices.map((close, i) => {
    const open = prices[Math.max(0, i - 1)]!;
    const interval = clock.step();
    return Object.freeze({ asset: 'BTC' as const, openTime: interval.openTime, closeTime: interval.closeTime,
      open: format(open), high: format(open > close ? open : close),
      low: format(open < close ? open : close), close: format(close), volume: '0.00000000' });
  }));
}

describe('price precision', () => {
  const base = 1_000_000_000_000_000_000_000_000n;
  const precisionError = /precision/i;

  test.each(consumers)('%s rejects the 30-candle exact rising regression before calculating', (_, calculate) => {
    const input = exactCandles(Array.from({ length: 30 }, (_, i) => base + BigInt(i)));
    expect(input[0]!.close).toBe('10000000000000000.00000000');
    expect(input[29]!.close).toBe('10000000000000000.00000029');
    const before = JSON.stringify(input);
    for (let attempt = 0; attempt < 2; attempt++) {
      expect(() => validateHistory(input, now)).toThrow(RangeError);
      expect(() => validateHistory(input, now)).toThrow(precisionError);
      expect(() => calculate(input, now)).toThrow(precisionError);
    }
    expect(JSON.stringify(input)).toBe(before);
  });

  test.each([
    { high: '10000000000000000.00000001' },
    { low: '9999999999999999.99999999' },
    { open: '10000000000000000.00000001', high: '10000000000000004.00000000' },
    { close: '10000000000000000.00000001', high: '10000000000000004.00000000' },
  ])('rejects OHLC precision collapse: %j', patch => {
    const input = [{ ...exactCandles([base])[0]!, ...patch }];
    expect(() => validateHistory(input, now)).toThrow(precisionError);
  });

  test('detects collisions across nonadjacent candles in either price direction', () => {
    // Flat OHLC within each candle isolates precision loss across the history.
    for (const prices of [[base, base + 400_000_000n, base + 1n], [base + 1n, base + 400_000_000n, base]]) {
      const input = exactCandles(prices).map(c => ({ ...c, open: c.close, high: c.close, low: c.close }));
      expect(() => validateHistory(input, now)).toThrow(precisionError);
    }
  });

  test.each([1n, 6_000_000_000_000n, base])('preserves adequately distinguishable prices from base %s', start => {
    const step = start === base ? 400_000_000n : 1n;
    const input = exactCandles(Array.from({ length: 30 }, (_, i) => start + BigInt(i) * step));
    const before = JSON.stringify(input);
    const first = validateHistory(input, now);
    expect(first).toHaveLength(30);
    expect(new Set(first.map(c => c.close)).size).toBe(30);
    expect(validateHistory(input, now)).toEqual(first);
    expect(rsi(input, now)[14]).toBe(100);
    expect(atr(input, now)[14]).toBeCloseTo(Number(step) / 100_000_000, 12);
    expect(adx(input, now)[27]!.adx).toBe(100);
    expect(JSON.stringify(input)).toBe(before);
  });

  test('accepts repeated identical large prices without a blanket magnitude limit', () => {
    const input = exactCandles(Array<bigint>(30).fill(base));
    expect(validateHistory(input, now)).toHaveLength(30);
    expect(rsi(input, now)[14]).toBe(50);
    expect(atr(input, now)[14]).toBe(0);
    expect(adx(input, now)[27]!.adx).toBe(0);
  });
});

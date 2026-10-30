import { aggregateClosedHours } from '../../src/regimes/aggregate-hourly';
import { Candle, toDecimalString as dec } from '../../src/simulation/candle';

const start = Date.UTC(2026, 0, 1, 23);
function fixture(count: number): Candle[] {
  return Array.from({ length: count }, (_, i) => ({ asset: 'BTC',
    openTime: new Date(start + i * 300_000).toISOString(), closeTime: new Date(start + (i + 1) * 300_000).toISOString(),
    open: '100.00000000', close: dec(10_000_000_000n + BigInt(i) * 100_000_000n),
    high: dec(20_000_000_000n + BigInt(i)), low: dec(5_000_000_000n - BigInt(i)),
    volume: '10000000000000000.00000001' }));
}
const now = '2026-01-02T12:00:00.000Z';

test.each([[0, 0], [11, 0], [12, 1], [13, 1], [24, 2]])('%s five-minute candles yield %s complete hours', (count, expected) => {
  expect(aggregateClosedHours(fixture(count), now)).toHaveLength(expected);
});

test('exact OHLC extrema, first open, last close, bigint volume and UTC day boundary', () => {
  const result = aggregateClosedHours(fixture(24), now);
  expect(result[0]).toEqual({ asset: 'BTC', openTime: '2026-01-01T23:00:00.000Z', closeTime: '2026-01-02T00:00:00.000Z',
    open: '100.00000000', high: '200.00000011', low: '49.99999989', close: '111.00000000',
    volume: '120000000000000000.00000012' });
  expect(result[1]!.openTime).toBe(result[0]!.closeTime);
  expect(result[1]!.high).toBe('200.00000023');
  expect(result[1]!.low).toBe('49.99999977');
  expect(result[1]!.close).toBe('123.00000000');
});

test('incomplete suffix cannot leak its extremes or close; immutable deterministic results', () => {
  const input = fixture(13);
  input[12] = { ...input[12]!, high: '9999.00000000', low: '1.00000000', close: '9998.00000000' };
  const frozen = Object.freeze(input.map(c => Object.freeze(c))), before = JSON.stringify(frozen);
  const result = aggregateClosedHours(frozen, now);
  expect(result).toEqual(aggregateClosedHours(frozen.slice(0, 12), frozen[11]!.closeTime));
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result[0])).toBe(true);
  expect(JSON.stringify(frozen)).toBe(before);
  expect(aggregateClosedHours(frozen.map(c => ({ ...c, asset: 'ETH' })), now)[0]!.asset).toBe('ETH');
});

test('rejects malformed history including invalid/future incomplete suffix', () => {
  const data = fixture(24);
  for (const invalid of [data.slice(1), [data[0]!, data[0]!], [data[1]!, data[0]!],
    [...data.slice(0, 10), ...data.slice(11)], data.map((c, i) => i === 1 ? { ...c, asset: 'ETH' as const } : c),
    [...data.slice(0, 12), { ...data[12]!, high: '0.00000000' }]]) {
    expect(() => aggregateClosedHours(invalid, now)).toThrow(RangeError);
  }
  expect(() => aggregateClosedHours(data, data[22]!.closeTime)).toThrow(RangeError);
  expect(() => aggregateClosedHours(fixture(13), data[11]!.closeTime)).toThrow(RangeError);
});

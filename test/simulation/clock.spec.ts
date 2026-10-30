import { SimulationClock, FIVE_MINUTES_MS } from '../../src/simulation/clock';

const START = '2026-01-01T23:55:00.000Z';

describe('SimulationClock', () => {
  it('closes exactly one five-minute interval per step, across the UTC day boundary', () => {
    const clock = new SimulationClock(START);
    expect(clock.snapshot()).toEqual({ startTime: START, currentTime: START, steps: 0 });
    expect(clock.step()).toEqual({ sequence: 1, openTime: START, closeTime: '2026-01-02T00:00:00.000Z' });
    expect(clock.step()).toEqual({ sequence: 2, openTime: '2026-01-02T00:00:00.000Z', closeTime: '2026-01-02T00:05:00.000Z' });
    expect(clock.snapshot().steps).toBe(2);
  });

  it('replays monotonically from its initial configuration independently of the host clock', () => {
    const hostClock = jest.spyOn(Date, 'now').mockImplementation(() => { throw new Error('host clock forbidden'); });
    try {
      const a = new SimulationClock('2024-02-29T23:55:00Z');
      const b = new SimulationClock('2024-02-29T23:55:00.000Z');
      for (let step = 1; step <= 50; step++) {
        const interval = a.step();
        expect(interval).toEqual(b.step());
        expect(interval.sequence).toBe(step);
        expect(Date.parse(interval.closeTime) - Date.parse(interval.openTime)).toBe(FIVE_MINUTES_MS);
        expect(a.snapshot().currentTime).toBe(interval.closeTime);
        expect(Object.isFrozen(interval)).toBe(true);
      }
      expect(Object.isFrozen(a.snapshot())).toBe(true);
    } finally { hostClock.mockRestore(); }
  });

  it.each([
    '', 'not-a-date', '2026-01-01', '2026-01-01T00:00:00+00:00',
    '2026-01-01T00:00:00', '2026-02-30T00:00:00Z',
    '2026-01-01T00:01:00Z', '2026-01-01T00:00:01Z',
    '2026-01-01T00:00:00.001Z',
  ])('rejects invalid, non-UTC or unaligned start %s', (start) => {
    expect(() => new SimulationClock(start)).toThrow();
  });

  it('fails at the supported UTC boundary without advancing state', () => {
    const clock = new SimulationClock('9999-12-31T23:50:00Z');
    clock.step();
    const before = clock.snapshot();
    expect(() => clock.step()).toThrow(RangeError);
    expect(clock.snapshot()).toEqual(before);
  });
});

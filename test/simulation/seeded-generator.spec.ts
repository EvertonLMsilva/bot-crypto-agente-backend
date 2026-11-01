import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { runSmoke } from '../../src/main';
import { SimulationClock } from '../../src/simulation/clock';
import { ASSETS, parsePositivePrice, toDecimalString } from '../../src/simulation/candle';
import { SeededGenerator } from '../../src/simulation/seeded-generator';

const startTime = '2026-01-01T00:00:00.000Z';
function generator(seed = 'fixture-1', initialPrices = { BTC: '60000.00000000', ETH: '3000.00000000' }) {
  return new SeededGenerator(new SimulationClock(startTime), { seed, initialPrices });
}

describe('exact synthetic decimal representation', () => {
  it('formats zero, sub-unit and large values exactly', () => {
    expect(toDecimalString(0n)).toBe('0.00000000');
    expect(toDecimalString(1n)).toBe('0.00000001');
    expect(toDecimalString(123456789123456789n)).toBe('1234567891.23456789');
    expect(parsePositivePrice('1234567891.23456789')).toBe(123456789123456789n);
    expect(() => toDecimalString(-1n)).toThrow();
  });
  it.each(['0.00000000', '-1.00000000', '1', '01.00000000', '1.000000000', 'NaN', 'Infinity', '1e2', '1,00000000'])('rejects invalid price %s', (price) => {
    expect(() => parsePositivePrice(price)).toThrow();
  });
});

describe('SeededGenerator', () => {
  it('observes only immutable known openings without time or random consumption', () => {
    const clock = new SimulationClock(startTime), a = new SeededGenerator(clock, { seed: 'openings' });
    const b = new SeededGenerator(new SimulationClock(startTime), { seed: 'openings' });
    for (let i = 0; i < 4; i++) {
      const before = clock.snapshot();
      const opening = a.currentOpenings();
      expect(opening).toEqual(a.currentOpenings());
      expect(clock.snapshot()).toEqual(before);
      expect(Object.isFrozen(opening)).toBe(true);
      for (const v of opening) {
        expect(Object.keys(v).sort()).toEqual(['asOf', 'asset', 'price']);
        expect(Object.isFrozen(v)).toBe(true);
        expect(v.asOf).toBe(clock.snapshot().currentTime);
      }
      const next = a.next();
      expect(next).toEqual(b.next());
      expect(next.map(c => c.open)).toEqual(opening.map(o => o.price));
    }
  });

  it('rejects observing an opening after external clock advancement', () => {
    const clock = new SimulationClock(startTime), source = new SeededGenerator(clock, { seed: 'openings' });
    clock.step();
    expect(() => source.currentOpenings()).toThrow();
  });

  it('replays identical seed/configuration and a deterministic distinct seed', () => {
    const a = generator(); const b = generator();
    const otherA = generator('other'); const otherB = generator('other');
    const sequence = []; const otherSequence = [];
    for (let step = 0; step < 100; step++) {
      const batch = a.next(); const other = otherA.next();
      expect(batch).toEqual(b.next());
      expect(other).toEqual(otherB.next());
      sequence.push(batch); otherSequence.push(other);
    }
    expect(sequence).not.toEqual(otherSequence);
  });

  it('keeps BTC unaffected by ETH configuration, and ETH unaffected by BTC', () => {
    const base = generator();
    const changedEth = generator('fixture-1', { BTC: '60000.00000000', ETH: '1.00000000' });
    const changedBtc = generator('fixture-1', { BTC: '1.00000000', ETH: '3000.00000000' });
    for (let i = 0; i < 30; i++) {
      const batch = base.next();
      expect(changedEth.next()[0]).toEqual(batch[0]);
      expect(changedBtc.next()[1]).toEqual(batch[1]);
      expect(BigInt(batch[0].close.replace('.', '')) * 3000n).not.toBe(BigInt(batch[1].close.replace('.', '')) * 60000n);
    }
  });

  it.each(['60000.00000000', '0.00000001'])('publishes only valid, closed, chronological immutable OHLCV (initial BTC %s)', (btc) => {
    const clock = new SimulationClock(startTime);
    const source = new SeededGenerator(clock, { seed: 'ohlcv', initialPrices: { BTC: btc, ETH: '0.00000002' } });
    let previousCloseTime = startTime;
    let previousPrices = { BTC: btc, ETH: '0.00000002' };
    for (let step = 1; step <= 200; step++) {
      const batch = source.next();
      expect(Object.isFrozen(batch)).toBe(true);
      expect(batch.map((c) => c.asset)).toEqual(ASSETS);
      for (const candle of batch) {
        expect(candle.openTime).toBe(previousCloseTime);
        expect(candle.closeTime).toBe(clock.snapshot().currentTime);
        expect(Date.parse(candle.closeTime)).toBe(Date.parse(startTime) + step * 300000);
        expect(candle.open).toBe(previousPrices[candle.asset]);
        for (const price of [candle.open, candle.high, candle.low, candle.close, candle.volume]) {
          expect(price).toMatch(/^(0|[1-9]\d*)\.\d{8}$/);
        }
        const open = parsePositivePrice(candle.open), high = parsePositivePrice(candle.high);
        const low = parsePositivePrice(candle.low), close = parsePositivePrice(candle.close);
        expect(high >= open && high >= close && low <= open && low <= close && low > 0n).toBe(true);
        expect(BigInt(candle.volume.replace('.', '')) >= 0n).toBe(true);
        expect(Object.keys(candle).sort()).toEqual(['asset','close','closeTime','high','low','open','openTime','volume'].sort());
        expect(Object.isFrozen(candle)).toBe(true);
      }
      previousCloseTime = batch[0].closeTime;
      previousPrices = { BTC: batch[0].close, ETH: batch[1].close };
    }
  });

  it('has no wall-clock or unseeded random dependency in generation', () => {
    const now = jest.spyOn(Date, 'now').mockImplementation(() => { throw new Error('forbidden'); });
    const random = jest.spyOn(Math, 'random').mockImplementation(() => { throw new Error('forbidden'); });
    try { expect(generator().next()).toHaveLength(2); }
    finally { now.mockRestore(); random.mockRestore(); }
  });

  it('copies configuration and rejects empty seeds and clocks advanced outside the generator', () => {
    expect(() => generator('')).toThrow();
    const prices = { BTC: '60000.00000000', ETH: '3000.00000000' };
    const source = generator('fixture-1', prices);
    prices.BTC = '1.00000000';
    expect(source.next()).toEqual(generator().next());
    const clock = new SimulationClock(startTime);
    clock.step();
    expect(() => new SeededGenerator(clock, { seed: 'seed' })).toThrow();
    const cleanClock = new SimulationClock(startTime);
    const bound = new SeededGenerator(cleanClock, { seed: 'seed' });
    cleanClock.step();
    expect(() => bound.next()).toThrow();
    expect(cleanClock.snapshot().steps).toBe(1);
  });
});

describe('standalone NestJS lifecycle', () => {
  afterEach(() => jest.restoreAllMocks());

  it('bootstraps real modules and closes locally after three candles per asset', async () => {
    const sample = await runSmoke();
    expect(sample).toHaveLength(6);
    expect(sample).toEqual(await runSmoke());
    expect(sample.filter((c) => c.asset === 'BTC').map((c) => c.closeTime)).toEqual([
      '2026-01-01T00:05:00.000Z', '2026-01-01T00:10:00.000Z', '2026-01-01T00:15:00.000Z',
    ]);
  });

  it('closes a real context even when generation fails', async () => {
    const app = await NestFactory.createApplicationContext(AppModule.configure({ seed: 'failure', startTime }), { logger: false });
    const close = jest.spyOn(app, 'close');
    jest.spyOn(NestFactory, 'createApplicationContext').mockResolvedValue(app);
    jest.spyOn(app.get(SeededGenerator), 'next').mockImplementationOnce(() => { throw new Error('generation failed'); });
    await expect(runSmoke()).rejects.toThrow('generation failed');
    expect(close).toHaveBeenCalledTimes(1);
  });
});

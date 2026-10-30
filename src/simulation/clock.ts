export const FIVE_MINUTES_MS = 5 * 60 * 1000;
const LAST_SUPPORTED_BOUNDARY = Date.parse('9999-12-31T23:55:00.000Z');

export interface ClosedInterval {
  readonly sequence: number;
  readonly openTime: string;
  readonly closeTime: string;
}

export interface ClockSnapshot {
  readonly startTime: string;
  readonly currentTime: string;
  readonly steps: number;
}

/** Logical UTC clock. startTime is the opening boundary of the first interval. */
export class SimulationClock {
  readonly startTime: string;
  #current: number;
  #steps = 0;

  constructor(startTime: string) {
    const timestamp = Date.parse(startTime);
    const canonical = startTime.endsWith('.000Z') ? startTime : startTime.replace('Z', '.000Z');
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00(?:\.000)?Z$/.test(startTime)
      || !Number.isFinite(timestamp)
      || timestamp % FIVE_MINUTES_MS !== 0
      || new Date(timestamp).toISOString() !== canonical) {
      throw new RangeError('startTime must be a valid UTC five-minute boundary (Z, zero seconds/milliseconds)');
    }
    this.startTime = new Date(timestamp).toISOString();
    this.#current = timestamp;
  }

  snapshot(): Readonly<ClockSnapshot> {
    return Object.freeze({ startTime: this.startTime, currentTime: new Date(this.#current).toISOString(), steps: this.#steps });
  }

  step(): Readonly<ClosedInterval> {
    const next = this.#current + FIVE_MINUTES_MS;
    if (next > LAST_SUPPORTED_BOUNDARY) {
      throw new RangeError('Simulation reached the supported UTC boundary');
    }
    const openTime = new Date(this.#current).toISOString();
    this.#current = next;
    this.#steps += 1;
    return Object.freeze({ sequence: this.#steps, openTime, closeTime: new Date(next).toISOString() });
  }
}

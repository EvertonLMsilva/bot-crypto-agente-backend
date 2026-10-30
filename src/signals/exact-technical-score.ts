import { Candle } from '../simulation/candle';
import { TECHNICAL_FAMILIES, TechnicalAssessment } from '../strategies';
import { ExactTechnicalResult, Fraction, SerializedFraction } from './types';
export function rational(n: bigint, d = 1n): Fraction {
    if (d <= 0n)
        throw new RangeError('Positive rational denominator required');
    let a = n < 0n ? -n : n, b = d;
    while (b !== 0n) {
        const rest = a % b;
        a = b;
        b = rest;
    }
    return Object.freeze({ numerator: n / a, denominator: d / a });
}
export const add = (a: Fraction, b: Fraction): Fraction => rational(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);
export const subtract = (a: Fraction, b: Fraction): Fraction => rational(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);
export const multiply = (a: Fraction, b: Fraction): Fraction => rational(a.numerator * b.numerator, a.denominator * b.denominator);
export function divide(a: Fraction, b: Fraction): Fraction {
    if (b.numerator <= 0n)
        throw new RangeError('Positive rational divisor required');
    return rational(a.numerator * b.denominator, a.denominator * b.numerator);
}
export const compare = (a: Fraction, b: Fraction): -1 | 0 | 1 => {
    const n = a.numerator * b.denominator - b.numerator * a.denominator;
    return n < 0n ? -1 : n > 0n ? 1 : 0;
};
export const clip = (a: Fraction, maximum = 1n): Fraction => a.numerator <= 0n ? rational(0n)
    : compare(a, rational(maximum)) >= 0 ? rational(maximum) : a;
export const serialize = (a: Fraction): SerializedFraction => Object.freeze({ numerator: String(a.numerator), denominator: String(a.denominator) });
export function deserialize(a: SerializedFraction): Fraction {
    if (!a || typeof a.numerator !== 'string' || typeof a.denominator !== 'string'
        || !/^-?(0|[1-9]\d*)$/.test(a.numerator) || !/^[1-9]\d*$/.test(a.denominator))
        throw new RangeError('Invalid serialized fraction');
    return rational(BigInt(a.numerator), BigInt(a.denominator));
}
// Keep current exact state unreduced during recurrence, reducing integer states
// cheaply. Full MDC reduction is needed only for the three final assessments.
function smooth(a: Fraction, value: bigint, weight: bigint, divisor: bigint): Fraction {
    const n = a.numerator * weight + value * a.denominator, d = a.denominator * divisor;
    return n % d === 0n ? { numerator: n / d, denominator: 1n } : { numerator: n, denominator: d };
}
/** Candles were validated by C2. Its certified G values are the ONLY trigger
 * source; rational states/window are shared in one pass, never rebuilt per family.
 */
export function exactTechnicalScores(candles: readonly Candle[], technical: readonly TechnicalAssessment[]): readonly ExactTechnicalResult[] {
    const last = candles.at(-1);
    if (!last || technical.length !== 3 || technical.some((a, i) => a.family !== TECHNICAL_FAMILIES[i]
        || a.asset !== last.asset || a.closeTime !== last.closeTime || (a.G !== 0 && a.G !== 1)))
        throw new RangeError('C2 assessments must match the snapshot');
    const units = (s: string): bigint => BigInt(s.replace('.', ''));
    const window: {
        high: bigint;
        volume: bigint;
    }[] = [], oscillators: {
        gains: Fraction;
        losses: Fraction;
    }[] = [];
    let sum9 = 0n, sum21 = 0n, sumTR = 0n, sumGain = 0n, sumLoss = 0n, previousClose: bigint | null = null;
    let fast: Fraction | null = null, slow: Fraction | null = null, atr: Fraction | null = null;
    let gains: Fraction | null = null, losses: Fraction | null = null;
    let previousHigh: bigint | null = null, previousVolume: bigint | null = null;
    for (let i = 0; i < candles.length; i++) {
        const c = candles[i]!, close = units(c.close), high = units(c.high), low = units(c.low), volume = units(c.volume);
        if (i < 9)
            sum9 += close;
        if (i < 21)
            sum21 += close;
        if (i === 8)
            fast = rational(sum9, 9n);
        else if (fast)
            fast = smooth(fast, close, 4n, 5n);
        if (i === 20)
            slow = rational(sum21, 21n);
        else if (slow)
            slow = smooth(slow, close, 10n, 11n);
        if (previousClose !== null) {
            const abs = (n: bigint) => n < 0n ? -n : n;
            const tr = [high - low, abs(high - previousClose), abs(low - previousClose)].reduce((a, b) => a > b ? a : b);
            const change = close - previousClose, gain = change > 0n ? change : 0n, loss = change < 0n ? -change : 0n;
            if (i <= 14) {
                sumTR += tr;
                sumGain += gain;
                sumLoss += loss;
            }
            if (i === 14) {
                atr = rational(sumTR, 14n);
                gains = rational(sumGain, 14n);
                losses = rational(sumLoss, 14n);
            }
            else if (i > 14) {
                atr = smooth(atr!, tr, 13n, 14n);
                gains = smooth(gains!, gain, 13n, 14n);
                losses = smooth(losses!, loss, 13n, 14n);
            }
            if (gains && losses) {
                // States are replaced, never mutated. Keep only the final four pairs;
                // reducing every historical RSI is unnecessary for the last snapshot.
                oscillators.push({ gains, losses });
                if (oscillators.length > 4)
                    oscillators.shift();
            }
        }
        previousClose = close;
        previousHigh = window.length === 20 ? window.reduce((a, c) => a > c.high ? a : c.high, 0n) : null;
        previousVolume = window.length === 20 ? window.reduce((a, c) => a + c.volume, 0n) : null;
        if (window.length === 20)
            window.shift();
        window.push({ high, volume });
    }
    const previousRSI = oscillators.slice(0, -1).map(({ gains: g, losses: l }) => {
        const gain = g.numerator * l.denominator, loss = l.numerator * g.denominator;
        return gain + loss === 0n ? rational(50n) : rational(100n * gain, gain + loss);
    });
    const close = units(last.close), range = units(last.high) - units(last.low), volume = units(last.volume);
    const Q = range > 0n ? rational(close - units(last.low), range) : null;
    const V = previousVolume !== null && previousVolume > 0n ? clip(rational(40n * volume - 2n * previousVolume, previousVolume)) : null;
    return Object.freeze(technical.map(a => {
        const reasons: string[] = [];
        let F: Fraction | null = null;
        if (!atr)
            reasons.push('INDICATORS_UNAVAILABLE');
        else if (atr.numerator <= 0n)
            reasons.push('ZERO_ATR');
        if (!Q)
            reasons.push('ZERO_RANGE');
        if (V === null)
            reasons.push(previousVolume === null ? 'VOLUME_WINDOW_UNAVAILABLE' : 'ZERO_VOLUME_MEAN');
        if (atr && atr.numerator > 0n) {
            if (a.family === 'TREND' && fast && slow)
                F = clip(divide(multiply(rational(2n), subtract(fast, slow)), atr));
            else if (a.family === 'BREAKOUT' && previousHigh !== null)
                F = clip(divide(rational(2n * (close - previousHigh)), atr));
            else if (a.family === 'MEAN_REVERSION' && previousRSI.length === 3) {
                const minimum = previousRSI.reduce((x, y) => compare(x, y) <= 0 ? x : y);
                F = clip(divide(subtract(rational(35n), minimum), rational(15n)));
            }
        }
        if (F === null && !reasons.includes('INDICATORS_UNAVAILABLE'))
            reasons.push('INDICATORS_UNAVAILABLE');
        const T = F && Q && V && reasons.length === 0 ? add(add(rational(40n * BigInt(a.G)), multiply(rational(30n), F)), add(multiply(rational(20n), Q), multiply(rational(10n), V))) : null;
        return Object.freeze({ family: a.family, G: a.G, F: F ? serialize(F) : null, Q: Q ? serialize(Q) : null, V: V ? serialize(V) : null, T: T ? serialize(T) : null, reasons: Object.freeze(reasons) });
    }));
}

import { add, compare, deserialize, multiply, rational, serialize } from './exact-technical-score';
import { GlobalScore, SerializedFraction } from './types';
export function globalScore(T: SerializedFraction | null, R: number | null, C: SerializedFraction | null, A: number, H: 0 = 0): GlobalScore | null {
    if (H !== 0)
        throw new RangeError('Only operational H=0 is permitted');
    if (T === null || R === null || C === null)
        return null;
    if (![60, 80, 90, 100].includes(R) || ![50, 100].includes(A))
        throw new RangeError('Invalid R/A');
    const t = deserialize(T), c = deserialize(C);
    if ([t, c].some(v => compare(v, rational(0n)) < 0 || compare(v, rational(100n)) > 0))
        throw new RangeError('Score component outside0..100');
    const raw = multiply(add(add(multiply(rational(35n), t), rational(25n * BigInt(R))), add(multiply(rational(15n), c), rational(10n * BigInt(A)))), rational(1n, 100n));
    const rounded = Number((2n * raw.numerator + raw.denominator) / (2n * raw.denominator));
    return Object.freeze({ raw: serialize(raw), rounded, thresholdMet: rounded >= 70 });
}

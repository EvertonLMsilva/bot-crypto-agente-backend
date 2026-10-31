export const FIXED8_SCALE = 100_000_000n;
function nonnegative(value: bigint): void {
  if (typeof value !== 'bigint' || value < 0n) throw new RangeError('Nonnegative bigint units required');
}
export function parseFixed8(value: string): bigint {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)\.\d{8}$/.test(value)) throw new RangeError('Canonical nonnegative fixed8 decimal required');
  return BigInt(value.replace('.', ''));
}
export function formatFixed8(units: bigint): string {
  nonnegative(units);
  return `${units / FIXED8_SCALE}.${String(units % FIXED8_SCALE).padStart(8, '0')}`;
}
export function divideDown(numerator: bigint, denominator: bigint): bigint {
  nonnegative(numerator);
  if (typeof denominator !== 'bigint' || denominator <= 0n) throw new RangeError('Positive bigint divisor required');
  return numerator / denominator;
}
export function divideUp(numerator: bigint, denominator: bigint): bigint {
  const down = divideDown(numerator, denominator);
  return down + (numerator % denominator === 0n ? 0n : 1n);
}
export function multiplyFixed8(a: bigint, b: bigint, rounding: 'DOWN' | 'UP'): bigint {
  nonnegative(a); nonnegative(b);
  if (rounding !== 'DOWN' && rounding !== 'UP') throw new RangeError('Explicit financial rounding required');
  return rounding === 'DOWN' ? divideDown(a * b, FIXED8_SCALE) : divideUp(a * b, FIXED8_SCALE);
}

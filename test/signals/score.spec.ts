import { globalScore } from '../../src/signals/score';
const q = (n: string | number, d: string | number = 1) => ({ numerator: String(n), denominator: String(d) });

test.each([[q(640, 7), 100, 50, 70], [q(690, 7), 90, 50, 70], [q(100), 80, 50, 68],
  [q(640, 7), 80, 100, 70], [q(100), 60, 100, 68]] as const)
('approved H0 threshold T=%j R=%s A=%s -> %s', (T, R, A, rounded) => {
  expect(globalScore(T, R, q(50), A)!.rounded).toBe(rounded);
});

test('69.50 half-up and exact rational neighbours without Number decisions', () => {
  const equality = globalScore(q(640, 7), 100, q(50), 50)!;
  expect(equality).toEqual({ raw: q(139, 2), rounded: 70, thresholdMet: true });
  const below = globalScore(q(639999999999999999999n.toString(), '7000000000000000000'), 100, q(50), 50)!;
  const above = globalScore(q(640000000000000000001n.toString(), '7000000000000000000'), 100, q(50), 50)!;
  expect(below.rounded).toBe(69); expect(above.rounded).toBe(70);
});

test('no context/technical evidence or R means no operational score; H positive is rejected', () => {
  expect(globalScore(q(100), 100, null, 50)).toBeNull();
  expect(globalScore(null, 100, q(50), 50)).toBeNull();
  expect(globalScore(q(100), null, q(50), 50)).toBeNull();
  expect(() => globalScore(q(100), 100, q(50), 50, 1 as 0)).toThrow(RangeError);
  for (const invalid of [q(101), q(-1), q(1, 0), q('NaN'), q(1, -1)]) {
    expect(() => globalScore(invalid, 100, q(50), 50)).toThrow(RangeError);
  }
  expect(() => globalScore(q(100), 0, q(50), 50)).toThrow(RangeError);
  expect(() => globalScore(q(100), 100, q(50), 60)).toThrow(RangeError);
});

import { parseFixed8, formatFixed8, divideDown, divideUp, multiplyFixed8 } from '../../src/budget/fixed8';

test.each(['0.00000000','0.00000001','10000.00000000','10000000000000000.00000001'])('exact decimal round trip %s',value=>{
  expect(formatFixed8(parseFixed8(value))).toBe(value);
});
test('one tick beyond Number precision remains distinguishable',()=>{
  expect(parseFixed8('10000000000000000.00000001')-parseFixed8('10000000000000000.00000000')).toBe(1n);
});
test.each(['1','1.0','01.00000000','-1.00000000','1e8','NaN','Infinity',' 1.00000000','1.000000001'])('reject ambiguous decimal %s',value=>{
  expect(()=>parseFixed8(value)).toThrow(RangeError);
});
test('down/up division and financial product rounding differ from half-up',()=>{
  expect(divideDown(10n,3n)).toBe(3n);expect(divideUp(10n,3n)).toBe(4n);
  expect(divideUp(9n,3n)).toBe(3n);expect(divideUp(0n,3n)).toBe(0n);
  expect(multiplyFixed8(1n,1n,'DOWN')).toBe(0n);expect(multiplyFixed8(1n,1n,'UP')).toBe(1n);
  expect(multiplyFixed8(100000000n,100000001n,'UP')).toBe(100000001n);
});
test('negative values and zero divisors fail explicitly',()=>{
  expect(()=>formatFixed8(-1n)).toThrow(RangeError);
  for(const divide of [divideDown,divideUp]){
    expect(()=>divide(1n,0n)).toThrow(RangeError);expect(()=>divide(-1n,1n)).toThrow(RangeError);
  }
  expect(()=>multiplyFixed8(1n,-1n,'UP')).toThrow(RangeError);
});

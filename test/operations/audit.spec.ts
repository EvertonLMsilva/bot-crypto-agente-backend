import { createDecisionAudit } from '../../src/operations/audit';
import { DecisionAudit } from '../../src/operations/types';

function audit():DecisionAudit {
  return {decisionId:'decision-1',asset:'BTC',asOf:'2026-01-01T00:05:00.000Z',policyId:'BTC-P0',policyVersion:'1',
    type:'WAIT',position:{asset:'BTC',asOf:'2026-01-01T00:05:00.000Z',status:'FLAT'},reasons:['NO_QUALIFIED_REPRESENTATIVE'],
    exitEvaluation:'NOT_APPLICABLE',selection:{asset:'BTC',asOf:'2026-01-01T00:05:00.000Z',policyId:'BTC-P0',policyVersion:'1',
      context:{status:'VALID',C:{numerator:'50000000000000000000001',denominator:'1000000000000000000000'},U:0,groups:[],reason:'VALID_FEED'},
      assessments:[],representative:null,discarded:[]}};
}
function assertFrozen(value:unknown):void {
  if(value&&typeof value==='object'){
    expect(Object.isFrozen(value)).toBe(true);
    for(const child of Object.values(value))assertFrozen(child);
  }
}
test('audit is a deeply frozen independent copy, preserving exact serializable fractions',()=>{
  const input=audit(),before=JSON.stringify(input),output=createDecisionAudit(input);
  expect(output).toEqual(input);expect(output).not.toBe(input);assertFrozen(output);
  expect(JSON.parse(JSON.stringify(output))).toEqual(output);
  expect(output.selection.context.C).toEqual({numerator:'50000000000000000000001',denominator:'1000000000000000000000'});
  expect(JSON.stringify(input)).toBe(before);expect(Object.isFrozen(input)).toBe(false);
  expect(Object.isFrozen(input.selection.context.C)).toBe(false);
  (input.selection.context.C as {numerator:string}).numerator='0';
  expect(output.selection.context.C!.numerator).toBe('50000000000000000000001');
  expect(()=>{(output.reasons as string[]).push('changed');}).toThrow();
});
test('audit rejects non-serializable or non-finite evidence rather than losing precision silently',()=>{
  for(const invalid of [NaN,Infinity,1n,undefined,()=>0]){
    expect(()=>createDecisionAudit({...audit(),decisionId:invalid} as unknown as DecisionAudit)).toThrow(RangeError);
  }
});

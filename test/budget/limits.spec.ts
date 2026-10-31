import { evaluateBudgetLimits } from '../../src/budget/limits';
import { BudgetSnapshot } from '../../src/budget/types';
function portfolio():BudgetSnapshot{return {asOf:'2026-01-01T01:00:00.000Z',state:'RUNNING',equity:'10000.00000000',dayOpeningEquity:'10000.00000000',
  availableCash:'10000.00000000',reservedCash:'0.00000000',committedExposure:{BTC:'0.00000000',ETH:'0.00000000'},committedRisk:'0.00000000',
  positions:{BTC:'FLAT',ETH:'FLAT'},reservations:{BTC:'NONE',ETH:'NONE'}};}
test('limits use supplied equity; reference10000 does not create any balance',()=>{
  const result=evaluateBudgetLimits(portfolio(),'BTC','1000.00000000','100.00000000');
  expect(result.eligible).toBe(true);expect(result.limits).toMatchObject({referenceInitialCapital:'10000.00000000',targetExposure:'1000.00000000',
    individualExposure:'2000.00000000',totalExposure:'4000.00000000',operationRisk:'100.00000000',openRisk:'200.00000000',dailyLoss:'300.00000000'});
});
test('individual exposure20% and total40% accept equality and reject one tick above',()=>{
  const p=portfolio(),exact={...p,committedExposure:{BTC:'1000.00000000',ETH:'2000.00000000'}};
  expect(evaluateBudgetLimits(exact,'BTC','1000.00000000','1.00000000').eligible).toBe(true);
  expect(evaluateBudgetLimits({...exact,committedExposure:{...exact.committedExposure,BTC:'1000.00000001'}},'BTC','1000.00000000','1.00000000').reasons)
    .toEqual(expect.arrayContaining(['INDIVIDUAL_EXPOSURE_LIMIT','TOTAL_EXPOSURE_LIMIT']));
  expect(evaluateBudgetLimits({...exact,committedExposure:{BTC:'1000.00000000',ETH:'2000.00000001'}},'BTC','1000.00000000','1.00000000').reasons)
    .toEqual(['TOTAL_EXPOSURE_LIMIT']);
});
test('planned operation1% and open2% boundaries are exact',()=>{
  const p={...portfolio(),committedRisk:'100.00000000'};
  expect(evaluateBudgetLimits(p,'BTC','1000.00000000','100.00000000').eligible).toBe(true);
  expect(evaluateBudgetLimits(p,'BTC','1000.00000000','100.00000001').reasons)
    .toEqual(expect.arrayContaining(['OPERATION_RISK_LIMIT','OPEN_RISK_LIMIT']));
  expect(evaluateBudgetLimits({...p,committedRisk:'100.00000001'},'BTC','1000.00000000','100.00000000').reasons).toEqual(['OPEN_RISK_LIMIT']);
});
test('daily loss exactly3% blocks; one tick below and unrounded daily threshold are preserved',()=>{
  const p={...portfolio(),equity:'9700.00000000',availableCash:'9700.00000000'};
  expect(evaluateBudgetLimits(p,'BTC','1.00000000','0.00000000').reasons).toContain('DAILY_LOSS_LIMIT');
  expect(evaluateBudgetLimits({...p,equity:'9700.00000001'},'BTC','1.00000000','0.00000000').eligible).toBe(true);
  const fraction={...p,dayOpeningEquity:'10000.00000001',equity:'9700.00000001'};
  expect(evaluateBudgetLimits(fraction,'BTC','1.00000000','0.00000000').eligible).toBe(true);
  expect(evaluateBudgetLimits({...fraction,equity:'9700.00000000'},'BTC','1.00000000','0.00000000').reasons).toContain('DAILY_LOSS_LIMIT');
});
test('cash equality is sufficient; a tick short rejects without using reserved cash',()=>{
  const p={...portfolio(),availableCash:'1000.00000000',reservedCash:'500.00000000'};
  expect(evaluateBudgetLimits(p,'BTC','1000.00000000','1.00000000').eligible).toBe(true);
  expect(evaluateBudgetLimits({...p,availableCash:'999.99999999'},'BTC','1000.00000000','1.00000000').reasons).toEqual(['INSUFFICIENT_AVAILABLE_CASH']);
});
test.each(['RECOVERING','ENTRY_SUSPENDED','MANUAL_REVIEW_REQUIRED'] as const)('%s blocks favorable quotation',state=>{
  expect(evaluateBudgetLimits({...portfolio(),state},'BTC','1.00000000','0.00000000').reasons).toContain(`STATE_${state}`);
});
test.each(['OPEN','UNKNOWN'] as const)('position %s blocks only its own asset',status=>{
  const p={...portfolio(),positions:{BTC:status,ETH:'FLAT' as const}};
  expect(evaluateBudgetLimits(p,'BTC','1.00000000','0.00000000').reasons).toContain(`POSITION_${status}`);
  expect(evaluateBudgetLimits(p,'ETH','1.00000000','0.00000000').eligible).toBe(true);
});
test.each(['ACTIVE','UNKNOWN'] as const)('reservation %s blocks a new commitment',status=>{
  expect(evaluateBudgetLimits({...portfolio(),reservations:{BTC:status,ETH:'NONE'}},'BTC','1.00000000','0.00000000').reasons).toContain(`RESERVATION_${status}`);
});
test('maxima round downward; asset exposures are not mixed and gains do not invent daily loss',()=>{
  const p={...portfolio(),equity:'10000.00000001',committedExposure:{BTC:'2000.00000000',ETH:'0.00000000'}};
  expect(evaluateBudgetLimits(p,'BTC','0.00000001','0.00000000').reasons).toContain('INDIVIDUAL_EXPOSURE_LIMIT');
  expect(evaluateBudgetLimits(p,'ETH','0.00000001','0.00000000').eligible).toBe(true);
  expect(evaluateBudgetLimits(p,'ETH','0.00000001','0.00000000').projected.dailyLoss).toBe('0.00000000');
});
test('missing, invalid or inconsistent snapshots explicitly fail',()=>{
  for(const patch of [{equity:'-1.00000000'},{availableCash:'10001.00000000'},{reservedCash:'1.00000000'},
    {state:'INVALID'},{positions:{BTC:'CLOSED',ETH:'FLAT'}},{reservations:{BTC:'BAD',ETH:'NONE'}},
    {committedExposure:{BTC:'0.00000000'}},{asOf:'2026-02-30T01:00:00.000Z'}]){
    expect(()=>evaluateBudgetLimits({...portfolio(),...patch} as BudgetSnapshot,'BTC','1.00000000','0.00000000')).toThrow(RangeError);
  }
});

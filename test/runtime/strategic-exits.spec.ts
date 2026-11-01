import { strategicExit, ExitOrigin, evaluateStrategicExits } from '../../src/runtime/strategic-exits';
import { ExecutedPosition } from '../../src/operations';
import { Candle } from '../../src/simulation/candle';

function history(prices:string[]):Candle[]{return prices.map((price,i)=>({asset:'BTC',openTime:new Date(Date.UTC(2026,0,1,0,i*5)).toISOString(),closeTime:new Date(Date.UTC(2026,0,1,0,(i+1)*5)).toISOString(),open:price,high:price,low:price,close:price,volume:'100.00000000'}));}
function position(openedAt:string):ExecutedPosition{return {id:'position',decisionId:'decision',reservationId:'reservation',asset:'BTC',strategyId:'strategy',strategyVersion:'1',quantity:'1.00000000',entryPrice:'101.00000000',entryCost:'101.10100000',plannedRisk:'3.00000000',openedAt,closedAt:null,status:'OPEN',stop:{numerator:'9898000000',denominator:'1'},take:{numerator:'10504000000',denominator:'1'},realizedPnl:'0.00000000'};}
function origin(p:ExecutedPosition,family:ExitOrigin['family'],breakoutLevel:string|null=null):ExitOrigin{return {positionId:p.id,decisionId:p.decisionId,strategyId:p.strategyId,strategyVersion:p.strategyVersion,signalAsOf:p.openedAt,family,breakoutLevel};}
test('trend requires two post-entry closed bars below exact EMA21; equality is not below',()=>{
 const h=history([...Array(21).fill('100.00000000'),'99.00000000','98.00000000']),p=position(h[20]!.closeTime),o=origin(p,'TREND');
 expect(strategicExit(p,o,h.slice(0,22),h[21]!.closeTime)).toBeNull();const exit=strategicExit(p,o,h,h[22]!.closeTime);expect(exit?.eligibleOpen).toBe(h[22]!.closeTime);
 const flat=history(Array(23).fill('100.00000000'));expect(strategicExit(p,o,flat,flat[22]!.closeTime)).toBeNull();
});
test('breakout uses original frozen level and requires two strictly lower closes',()=>{
 const h=history([...Array(20).fill('100.00000000'),'101.00000000','99.00000000','98.00000000']),p=position(h[20]!.closeTime),o=origin(p,'BREAKOUT','100.00000000');
 expect(strategicExit(p,o,h.slice(0,22),h[21]!.closeTime)).toBeNull();expect(strategicExit(p,o,h,h[22]!.closeTime)?.strategyVersion).toBe('1');
 expect(()=>strategicExit(p,{...o,breakoutLevel:null},h,h[22]!.closeTime)).toThrow();expect(()=>strategicExit(p,{...o,breakoutLevel:'99.00000000'},h,h[22]!.closeTime)).toThrow();
});
test('mean reversion exits at SMA20 equality and not below',()=>{
 const h=history(Array(21).fill('100.00000000')),p=position(h[19]!.closeTime);expect(strategicExit(p,origin(p,'MEAN_REVERSION'),h,h[20]!.closeTime)).not.toBeNull();
 const low=history([...Array(20).fill('100.00000000'),'99.00000000']);expect(strategicExit(p,origin(p,'MEAN_REVERSION'),low,low[20]!.closeTime)).toBeNull();
});
test('future candles, mixed assets, closed positions, origin mismatches and absent history reject',()=>{
 const h=history(Array(23).fill('100.00000000')),p=position(h[20]!.closeTime),o=origin(p,'TREND');
 for(const [pos,proof,bars,at] of [[p,o,h,h[21]!.closeTime],[p,o,h.map(c=>({...c,asset:'ETH'})),h[22]!.closeTime],[{...p,status:'CLOSED'},o,h,h[22]!.closeTime],[p,{...o,strategyVersion:'2'},h,h[22]!.closeTime],[p,o,[],h[22]!.closeTime]] as const)
 expect(()=>strategicExit(pos as ExecutedPosition,proof,bars as Candle[],at)).toThrow();
});
test('an existing open position without stored origin blocks integration',()=>{
 const h=history(Array(23).fill('100.00000000')),p=position(h[20]!.closeTime);
 expect(()=>evaluateStrategicExits({positions:[p],reservations:[],origins:[]} as any,{BTC:h,ETH:[]},h[22]!.closeTime)).toThrow('origin');
});

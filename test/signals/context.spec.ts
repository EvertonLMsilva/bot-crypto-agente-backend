import { contextC } from '../../src/signals/context';
import { ContextEvent,ContextFeed } from '../../src/signals/types';
const time=(h:number)=>`2026-01-01T${String(h).padStart(2,'0')}:00:00.000Z`;
const q=(n:number,d=1)=>({numerator:String(n),denominator:String(d)});
function event(patch:Partial<ContextEvent>={}):ContextEvent{
  return {eventId:'e1',groupId:'g1',revision:1,previousEventId:null,source:'simulated',publishedAt:time(0),availableAt:time(0),sequence:1,
    category:'CRYPTO',state:'CONFIRMED',impacts:{BTC:{direction:1,intensity:30},ETH:{direction:-1,intensity:10}},...patch};
}
const feed=(events:readonly ContextEvent[]):ContextFeed=>({status:'VALID',events});

test('explicit empty valid feed is neutral; absent/invalid feed never defaults to50',()=>{
  expect(contextC(feed([]),'BTC',time(0))).toMatchObject({status:'VALID',C:q(50),U:0});
  for(const bad of [undefined,null,{status:'INVALID',events:[]},{status:'VALID'}, {status:'VALID',events:[null]}]){
    expect(contextC(bad as ContextFeed,'BTC',time(0))).toMatchObject({status:'UNAVAILABLE',C:null});
  }
});
test.each([[0,80],[3,65],[6,50]] as const)('crypto decay at%s hours -> C%s',(h,C)=>{
  expect(contextC(feed([event()]),'BTC',time(h)).C).toEqual(q(C));
});
test('different asset impacts and the24/72h windows are independent',()=>{
  expect(contextC(feed([event()]),'ETH',time(3)).C).toEqual(q(45));
  expect(contextC(feed([event({category:'MACRO'})]),'BTC',time(12)).C).toEqual(q(65));
  const end='2026-01-04T00:00:00.000Z';
  expect(contextC(feed([event({category:'GEOPOLITICAL_REGULATORY'})]),'BTC',end).C).toEqual(q(50));
});
test('rumors have no positive bonus; independent-group penalty5 is capped10 and expires',()=>{
  const rumor=event({state:'RUMOR'});
  expect(contextC(feed([rumor]),'BTC',time(0))).toMatchObject({C:q(45),U:5});
  const events=[rumor,event({eventId:'e2',groupId:'g2',sequence:2,state:'RUMOR'}),event({eventId:'e3',groupId:'g3',sequence:3,state:'RUMOR'})];
  expect(contextC(feed(events),'BTC',time(0))).toMatchObject({C:q(40),U:10});
  expect(contextC(feed(events),'BTC',time(6))).toMatchObject({C:q(50),U:0});
});
test('confirmation, correction and retraction are linked and prospective, with original group lifetime',()=>{
  const root=event({state:'RUMOR'});
  const confirm=event({eventId:'e2',revision:2,previousEventId:'e1',sequence:2,publishedAt:time(2),availableAt:time(2)});
  const correction=event({eventId:'e3',revision:3,previousEventId:'e2',sequence:3,publishedAt:time(3),availableAt:time(3),impacts:{BTC:{direction:-1,intensity:30}}});
  const retract=event({eventId:'e4',revision:4,previousEventId:'e3',sequence:4,publishedAt:time(4),availableAt:time(4),state:'RETRACTED',impacts:{}});
  const f=feed([root,confirm,correction,retract]);
  expect(contextC(f,'BTC',time(1)).C).toEqual(q(45));
  expect(contextC(f,'BTC',time(2)).C).toEqual(q(70));
  expect(contextC(f,'BTC',time(3)).C).toEqual(q(35));
  expect(contextC(f,'BTC',time(4)).C).toEqual(q(50));
  expect(contextC(feed([root]),'BTC',time(1))).toEqual(contextC(f,'BTC',time(1)));
});
test('identical duplicates are idempotent and republication never restarts decay',()=>{
  const root=event(),again=event({eventId:'e2',revision:2,previousEventId:'e1',sequence:2,publishedAt:time(1),availableAt:time(1)});
  expect(contextC(feed([root,{...root}]),'BTC',time(0))).toEqual(contextC(feed([root]),'BTC',time(0)));
  expect(contextC(feed([root,again]),'BTC',time(3)).C).toEqual(q(65));
});
test('semantic conflict stays VALID/UNCERTAIN; opposite independent groups sum',()=>{
  const a=event(),b=event({eventId:'e2',sequence:2,impacts:{BTC:{direction:-1,intensity:30}}});
  const result=contextC(feed([a,b]),'BTC',time(0));
  expect(result).toMatchObject({status:'VALID',C:q(50)});expect(result.groups[0]!.state).toBe('UNCERTAIN');
  expect(contextC(feed([a,{...b,groupId:'g2',impacts:{BTC:{direction:-1,intensity:20}}}]),'BTC',time(0)).C).toEqual(q(60));
});
test('frozen inputs, stable ordering, future-event exclusion and clipped extremes',()=>{
  const root=Object.freeze(event()),future=event({eventId:'e2',groupId:'g2',sequence:2,publishedAt:time(3),availableAt:time(3)});
  const input=Object.freeze(feed(Object.freeze([root,future]))),before=JSON.stringify(input);
  const result=contextC(input,'BTC',time(2));
  expect(result).toEqual(contextC(feed([future,root]),'BTC',time(2)));
  expect(result).toEqual(contextC(feed([root]),'BTC',time(2)));
  expect(Object.isFrozen(result)).toBe(true);expect(Object.isFrozen(result.groups)).toBe(true);
  expect(JSON.stringify(input)).toBe(before);
  const many=Array.from({length:4},(_,i)=>event({eventId:`e${i}`,groupId:`g${i}`,sequence:i+1}));
  expect(contextC(feed(many),'BTC',time(0)).C).toEqual(q(100));
  expect(contextC(feed(many.map(e=>({...e,impacts:{BTC:{direction:-1 as const,intensity:30 as const}}}))), 'BTC',time(0)).C).toEqual(q(0));
});
test('structural identity, sequence, timestamp and revision failures make context unavailable',()=>{
  const root=event();
  const cases=[
    [root,event({source:'different'})],
    [root,event({eventId:'e2',groupId:'g2'})],
    [event({availableAt:'2026-02-30T00:00:00.000Z'})],
    [event({publishedAt:time(1),availableAt:time(0)})],
    [event({state:'RETRACTED'})],
    [event({revision:2,previousEventId:'missing'})],
    [root,event({eventId:'e2',revision:3,previousEventId:'e1',sequence:2})],
    [root,event({eventId:'e2',revision:2,previousEventId:'e1',groupId:'other',sequence:2})],
    [event({impacts:{BTC:{direction:1,intensity:40 as 30}}})],
  ];
  for(const events of cases)expect(contextC(feed(events),'BTC',time(4))).toMatchObject({status:'UNAVAILABLE',C:null});
});
test('sub-hour decay stays rational and publication alone is insufficient for availability',()=>{
  expect(contextC(feed([event()]),'BTC','2026-01-01T00:00:00.001Z').C).toEqual({numerator:'57599999',denominator:'720000'});
  const delayed=event({availableAt:time(2)});
  expect(contextC(feed([delayed]),'BTC',time(1)).C).toEqual(q(50));
  expect(contextC(feed([delayed]),'BTC',time(2)).C).toEqual(q(80));
  expect(contextC(feed([event({impacts:{ETH:{direction:1,intensity:10}}})]),'BTC',time(0)).groups).toEqual([]);
});
test('explicit uncertain group and rumor conflicts preserve no direction and bounded penalty',()=>{
  expect(contextC(feed([event({state:'UNCERTAIN'})]),'BTC',time(0))).toMatchObject({C:q(50),groups:[{state:'UNCERTAIN',contribution:q(0)}]});
  const rumor=event({eventId:'e2',sequence:2,state:'RUMOR'});
  expect(contextC(feed([event(),rumor]),'BTC',time(0))).toMatchObject({status:'VALID',C:q(45),U:5,groups:[{state:'UNCERTAIN'}]});
});

function concurrentRevisions():readonly [ContextEvent,ContextEvent,ContextEvent]{
  const root=event({state:'RUMOR'});
  const confirmed=event({eventId:'e2',revision:2,previousEventId:'e1',sequence:2,
    publishedAt:time(1),availableAt:time(1)});
  const retracted=event({eventId:'e3',revision:2,previousEventId:'e1',sequence:3,
    publishedAt:time(1),availableAt:time(1),state:'RETRACTED',impacts:{}});
  return [root,confirmed,retracted];
}
test.each([false,true])('concurrent confirmation/retraction remains uncertain in either arrival order: reversed=%s',reversed=>{
  const [root,confirmed,retracted]=concurrentRevisions();
  const events=reversed?[root,retracted,confirmed]:[root,confirmed,retracted];
  const before=JSON.stringify(events),result=contextC(feed(events),'BTC',time(1));
  expect(result).toMatchObject({status:'VALID',C:q(50),U:0,groups:[{groupId:'g1',state:'UNCERTAIN',
    eventIds:['e1','e2','e3'],anchorTime:time(0),contribution:q(0),rumorPenalty:0}]});
  expect(result).toEqual(contextC(feed([root,confirmed,retracted]),'BTC',time(1)));
  expect(contextC(feed(events),'BTC',time(0))).toEqual(contextC(feed([root]),'BTC',time(0)));
  expect(contextC(feed(events),'BTC',time(0)).C).toEqual(q(45));
  expect(JSON.stringify(events)).toBe(before);expect(Object.isFrozen(result.groups[0])).toBe(true);
});
test('a sole confirmation or retraction remains a valid prospective successor',()=>{
  const [root,confirmed,retracted]=concurrentRevisions();
  expect(contextC(feed([root,confirmed]),'BTC',time(1))).toMatchObject({status:'VALID',C:q(75),groups:[{state:'CONFIRMED',contribution:q(25)}]});
  expect(contextC(feed([root,retracted]),'BTC',time(1))).toMatchObject({status:'VALID',C:q(50),U:0,groups:[{state:'RETRACTED',contribution:q(0)}]});
});
test('higher sequence on either incompatible branch never resolves the semantic conflict',()=>{
  const [root,confirmed,retracted]=concurrentRevisions();
  for(const [confirmationSequence,retractionSequence] of [[2,3],[3,2]]){
    expect(contextC(feed([root,{...confirmed,sequence:confirmationSequence!},{...retracted,sequence:retractionSequence!}]),'BTC',time(1)))
      .toMatchObject({status:'VALID',C:q(50),groups:[{state:'UNCERTAIN',contribution:q(0)}]});
  }
});
test('independent confirmed group contributes while the conflicting group stays directionless',()=>{
  const events=concurrentRevisions();
  const other=event({eventId:'e4',groupId:'g2',sequence:4,publishedAt:time(1),availableAt:time(1),impacts:{BTC:{direction:1,intensity:10}}});
  const result=contextC(feed([...events,other]),'BTC',time(1));
  expect(result).toMatchObject({status:'VALID',C:q(60),groups:[{groupId:'g1',state:'UNCERTAIN',contribution:q(0)},
    {groupId:'g2',state:'CONFIRMED',contribution:q(10)}]});
});
test('identical terminal retractions are idempotent and do not create an artificial conflict',()=>{
  const [root,confirmed,retracted]=concurrentRevisions();
  expect(contextC(feed([root,retracted,{...retracted}]),'BTC',time(1)))
    .toEqual(contextC(feed([root,retracted]),'BTC',time(1)));
  expect(contextC(feed([root,confirmed,retracted,{...confirmed},{...retracted}]),'BTC',time(1)))
    .toEqual(contextC(feed([root,confirmed,retracted]),'BTC',time(1)));
  const secondRetraction={...retracted,eventId:'e4',sequence:4};
  expect(contextC(feed([root,retracted,secondRetraction]),'BTC',time(1)))
    .toMatchObject({status:'VALID',C:q(50),groups:[{state:'RETRACTED',contribution:q(0)}]});
});
test('a linear revision supersedes its ancestor without duplicate impact or renewed lifetime',()=>{
  const [root,confirmed]=concurrentRevisions();
  const correction=event({eventId:'e4',revision:3,previousEventId:'e2',sequence:4,publishedAt:time(2),availableAt:time(2)});
  const result=contextC(feed([correction,confirmed,root]),'BTC',time(2));
  expect(result).toMatchObject({status:'VALID',C:q(70),groups:[{state:'CONFIRMED',anchorTime:time(0),contribution:q(20)}]});
  const retract={...correction,state:'RETRACTED' as const,impacts:{}};
  expect(contextC(feed([root,confirmed,retract]),'BTC',time(2)))
    .toMatchObject({status:'VALID',C:q(50),groups:[{state:'RETRACTED',contribution:q(0)}]});
});

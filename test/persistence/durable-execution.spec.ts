import { open, temp, genesis, commit, cleanup, payload, authorizationCommand, openingCommand } from './crash-worker';
import { at, portfolio, configuration, batch, prices, raw, rows } from './crash-worker';
import { canonical, ENGINE_VERSION } from '../../src/persistence';
import { ExecutionCommand, createExitRequest } from '../../src/operations';
import { authorizeEntryBatch,createAuthorizationState } from '../../src/budget';
import { coordinateEntryBatch } from '../../src/coordination';
afterEach(cleanup);
test('lost response replay returns same durable receipt despite stale expected revision',()=>{const d=open();genesis(d);const first=commit(d);expect(commit(d)).toEqual(first);expect(d.loadState('sim').control.revision).toBe('1');});
function closeCommand(start=at,end='2026-01-01T01:05:00.000Z',close='100.00000000'):ExecutionCommand{return {id:JSON.stringify(['CLOSE',end]),kind:'CLOSE',asOf:end,
 candles:(['BTC','ETH'] as const).map(asset=>({asset,openTime:start,closeTime:end,open:'100.00000000',high:'101.00000000',low:'99.00000000',close,volume:'1.00000000'}))};}
test('multicycle sale persists signed PnL and survives repeated recovery without another credit',()=>{
 const path=temp(),d=open(path);genesis(d);commit(d);commit(d,openingCommand(),'open','1');const c=closeCommand(),end=c.kind==='CLOSE'?c.asOf:'';
 commit(d,c,'close','2');const s=d.loadState('sim').state;
 const p=s.portfolio,coordinator={asOf:end,opportunities:[],waits:[],nextState:{nextTieAsset:'ETH' as const},financialAuthorization:'NOT_EVALUATED' as const,execution:'NOT_EXECUTED' as const,
 audit:{previousState:{nextTieAsset:'ETH' as const},nextState:{nextTieAsset:'ETH' as const},ranking:[],ties:[],duplicates:[]}};
 const proof=authorizeEntryBatch(coordinator,p,prices,createAuthorizationState(p),end);
 const auth:ExecutionCommand={id:JSON.stringify(['AUTHORIZE',end]),kind:'AUTHORIZE',authorization:proof};
 d.commitOperation({simulationId:'sim',operationId:'auth-next',expectedRevision:'3',payload:payload(auth,{coordinator})});
 const exits=s.positions.map(pos=>createExitRequest(pos,end));const op:ExecutionCommand={...openingCommand(),id:JSON.stringify(['OPEN',end]),kind:'OPEN',asOf:end,
 openings:[{asset:'BTC',asOf:end,price:'100.00000000'},{asset:'ETH',asOf:end,price:'100.00000000'}],exits};
 const receipt=commit(d,op,'exit','4');const final=d.loadState('sim');expect(final.state.realizedPnl).toBe('-6.00000000');expect(final.state.portfolio.equity).toBe('9994.00000000');
 expect(final.state.fills).toHaveLength(4);expect(rows(path,'checkpoints')).toHaveLength(2);d.close();const next=open(path,false);
 expect(next.recover('sim').state).toEqual(final.state);expect(commit(next,op,'exit','0')).toEqual(receipt);expect(next.loadState('sim').state.fills).toHaveLength(4);
});
test('payload divergence, stale revision and another operation using an old command reject',()=>{
 const d=open();genesis(d);commit(d);const changed=structuredClone(authorizationCommand());if(changed.kind==='AUTHORIZE')Object.assign(changed.authorization,{execution:'FILLED'});
 expect(()=>commit(d,changed,'authorize','0')).toThrow(RangeError);expect(()=>commit(d,openingCommand(),'new','0')).toThrow('CONFLICT');
 expect(()=>commit(d,authorizationCommand(),'reused-command','1')).toThrow(RangeError);
});
test('noncanonical payload, revision, identity and future clocks fail without financial effects',()=>{
 const d=open();genesis(d);const base={simulationId:'sim',operationId:'operation',expectedRevision:'0',payload:payload(authorizationCommand())};
 for(const patch of [{payload:'{} '},{payload:'NaN'},{expectedRevision:'01'},{operationId:''}])expect(()=>d.commitOperation({...base,...patch})).toThrow(RangeError);
 expect(()=>d.commitOperation({...base,payload:payload(authorizationCommand(),{clock:{...configuration.clock,currentTime:'2026-01-01T01:05:00.000Z'}})})).toThrow(RangeError);
 expect(d.loadState('sim').control.revision).toBe('0');
});
test('coordinator context and generator cursor cannot diverge across restart',()=>{
 const d=open();genesis(d);const command=authorizationCommand();
 expect(()=>d.commitOperation({simulationId:'sim',operationId:'bad',expectedRevision:'0',payload:payload(command,{coordinator:null})})).toThrow(RangeError);
 expect(()=>d.commitOperation({simulationId:'sim',operationId:'bad-seed',expectedRevision:'0',payload:payload(command,{generator:{...configuration.generator,seed:'other'}})})).toThrow(RangeError);
 commit(d);const cursor=d.loadState('sim').control.cursor;expect(cursor.coordinatorState.nextTieAsset).toBe('ETH');expect(cursor.generator.seed).toBe('d5-test');
});
test('opening requires an explicit authorization/no-entry seal',()=>{
 const d=open();genesis(d);expect(()=>commit(d,openingCommand(),'open','0')).toThrow(RangeError);expect(d.loadState('sim').state.fills).toEqual([]);
});
test('UTC base and checkpoints survive midnight exactly',()=>{
 const start='2026-01-01T23:55:00.000Z',end='2026-01-02T00:00:00.000Z',p={...portfolio(),asOf:start},cfg={...configuration,clock:{startTime:start,currentTime:start,steps:0}};
 const d=open();d.createSimulation({simulationId:'sim',operationId:'genesis',initial:p,configuration:cfg});
 const coor=batch('BTC',start),refs={BTC:{...prices.BTC,closeTime:start},ETH:{...prices.ETH,closeTime:start}},a:ExecutionCommand={id:JSON.stringify(['AUTHORIZE',start]),kind:'AUTHORIZE',authorization:authorizeEntryBatch(coor,p,refs,createAuthorizationState(p),start)};
 const evidence=(command:ExecutionCommand,currentTime:string,steps:number,coordinator:unknown=null)=>canonical({command,evidence:{coordinator,clock:{startTime:start,currentTime,steps},generator:{...configuration.generator,confirmedSteps:steps}}});
 d.commitOperation({simulationId:'sim',operationId:'a',expectedRevision:'0',payload:evidence(a,start,0,coor)});
 const op:ExecutionCommand={id:JSON.stringify(['OPEN',start]),kind:'OPEN',asOf:start,openings:[{asset:'BTC',asOf:start,price:'100.00000000'},{asset:'ETH',asOf:start,price:'100.00000000'}],exits:[]};
 d.commitOperation({simulationId:'sim',operationId:'o',expectedRevision:'1',payload:evidence(op,start,0)});
 d.commitOperation({simulationId:'sim',operationId:'c',expectedRevision:'2',payload:evidence(closeCommand(start,end,'101.00000000'),end,1)});
 const r=d.recover('sim');expect(r.state.dailyBase).toBe('10008.49950000');expect(r.control.cursor.clock.currentTime).toBe(end);
});
test('ENTRY_SUSPENDED still processes verified protection without creating a new entry',()=>{
 const d=open();genesis(d);commit(d);commit(d,openingCommand(),'open','1');const c=closeCommand(),time=c.kind==='CLOSE'?c.asOf:'';commit(d,c,'close','2');
 const current=d.suspendEntries('sim','MANUAL_GUARD'),coordinator=coordinateEntryBatch([],time,current.control.cursor.coordinatorState);
 const proof=authorizeEntryBatch(coordinator,current.state.portfolio,prices,createAuthorizationState(current.state.portfolio),time);
 const auth:ExecutionCommand={id:JSON.stringify(['AUTHORIZE',time]),kind:'AUTHORIZE',authorization:proof};
 d.commitOperation({simulationId:'sim',operationId:'empty-authorize',expectedRevision:'3',payload:payload(auth,{coordinator})});
 const op:ExecutionCommand={id:JSON.stringify(['OPEN',time]),kind:'OPEN',asOf:time,
 openings:[{asset:'BTC',asOf:time,price:'97.00000000'},{asset:'ETH',asOf:time,price:'100.00000000'}],exits:[]};
 commit(d,op,'protected-open','4');const out=d.loadState('sim');expect(out.control.status).toBe('ENTRY_SUSPENDED');
 expect(out.state.positions.map(p=>p.status)).toEqual(['CLOSED','OPEN']);expect(out.state.fills).toHaveLength(3);expect(out.state.fills[2]!.reason).toBe('STOP');
 expect(out.state.positions[1]!.stop).toEqual(current.state.positions[1]!.stop);
});
test('an unwritable/closed store stays locally blocked even when the block cannot be persisted',()=>{
 const d=open();genesis(d);d.close();expect(()=>d.loadState('sim')).toThrow();expect(()=>commit(d)).toThrow('locally blocked');
});

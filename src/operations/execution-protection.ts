import { parseFixed8 } from '../budget/fixed8';
import { Candle } from '../simulation/candle';
import { ExecutionState, ExecutedPosition, ExactPrice, ExecutionFill } from './execution-types';
import { exact, executionAmounts, identity, signed, audit } from './execution-accounting';
import { formatFixed8 } from '../budget/fixed8';

function compare(price: string, level: ExactPrice): bigint {
  return parseFixed8(price) * BigInt(level.denominator) - BigInt(level.numerator);
}
export function openingProtection(p: ExecutedPosition, opening: string): { reason: 'STOP' | 'TAKE'; reference: ExactPrice } | null {
  if (compare(opening, p.stop) <= 0n) return { reason: 'STOP', reference: exact(parseFixed8(opening)) };
  if (compare(opening, p.take) >= 0n) return { reason: 'TAKE', reference: p.take };
  return null;
}
export function closedProtection(p: ExecutedPosition, candle: Candle): { reason: 'STOP' | 'TAKE'; reference: ExactPrice } | null {
  if (compare(candle.low, p.stop) <= 0n) return { reason: 'STOP', reference: p.stop };
  if (compare(candle.high, p.take) >= 0n) return { reason: 'TAKE', reference: p.take };
  return null;
}
export function sellPosition(s: ExecutionState, p: ExecutedPosition, reference: ExactPrice, reason: string, requestId: string | null = null): ExecutionState {
  const amounts = executionAmounts('SELL', p.quantity, reference);
  const fill: ExecutionFill = { id: identity('FILL', p.id, 'SELL'), positionId: p.id, reservationId: p.reservationId,
    asset: p.asset, asOf: s.asOf, side: 'SELL', reason, quantity: p.quantity, reference, ...amounts, slippage: '0.0005', feeRate: '0.001' };
  const realizedPnl = signed(parseFixed8(amounts.total) - parseFixed8(p.entryCost));
  return audit(s, { ...s, availableCash: formatFixed8(parseFixed8(s.availableCash) + parseFixed8(amounts.total)),
    positions: s.positions.map(v => v.id === p.id ? { ...v, status: 'CLOSED', closedAt: s.asOf, realizedPnl } : v),
    fills: [...s.fills, fill] }, 'EXIT_FILL', reason, identity('EXIT', p.id), p.reservationId, p.id, fill, requestId);
}

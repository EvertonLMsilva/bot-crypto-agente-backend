import { MarketRegime, VolatilityRegime } from '../regimes';
import { TechnicalFamily } from '../strategies';
export function regimeFit(regime: MarketRegime, family: TechnicalFamily, volatility: VolatilityRegime): Readonly<{
    eligible: boolean;
    R: number | null;
    reasons: readonly string[];
}> {
    const reasons: string[] = [];
    if (regime === 'DOWNTREND')
        reasons.push('DOWNTREND_BLOCKED');
    if (regime === 'UNKNOWN')
        reasons.push('UNKNOWN_REGIME');
    if (volatility === 'UNKNOWN')
        reasons.push('UNKNOWN_VOLATILITY');
    let R: number | null = null;
    if (volatility !== 'UNKNOWN') {
        if (regime === 'UPTREND' && family === 'TREND')
            R = volatility === 'NORMAL' ? 100 : 80;
        if (regime === 'UPTREND' && family === 'BREAKOUT')
            R = volatility === 'NORMAL' ? 90 : 80;
        if (regime === 'SIDEWAYS' && family === 'BREAKOUT')
            R = volatility === 'NORMAL' ? 80 : 60;
        if (regime === 'SIDEWAYS' && family === 'MEAN_REVERSION')
            R = volatility === 'NORMAL' ? 100 : 60;
    }
    if (R === null && reasons.length === 0)
        reasons.push('INCOMPATIBLE_REGIME_FAMILY');
    return Object.freeze({ eligible: reasons.length === 0 && R !== null, R: reasons.length === 0 ? R : null, reasons: Object.freeze(reasons) });
}

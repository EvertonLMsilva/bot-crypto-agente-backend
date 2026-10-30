/** Statistical floating-point results only; never amounts, fees or ledger entries.
 * Each output index matches the input candle; null means insufficient history.
 * Malformed/unavailable market data or arithmetic overflow throws RangeError.
 */
export type IndicatorSeries<T = number> = readonly (Readonly<T> | null)[];
export type EmaPeriod = 9 | 20 | 21 | 50;

export interface AdxPoint {
  readonly plusDI: number;
  readonly minusDI: number;
  readonly dx: number;
  readonly adx: number | null;
}

export interface BollingerPoint {
  readonly middle: number;
  readonly upper: number;
  readonly lower: number;
}

export interface NumericCandle {
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

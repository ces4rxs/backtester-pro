import Decimal from "decimal.js";

Decimal.set({ precision: 34, rounding: Decimal.ROUND_HALF_EVEN });

export { Decimal };
export type Dval = Decimal.Value;
export const D = (x: Dval) => new Decimal(x);

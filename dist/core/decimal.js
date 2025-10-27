import Decimal from "decimal.js";
Decimal.set({ precision: 34, rounding: Decimal.ROUND_HALF_EVEN });
export { Decimal };
export const D = (x) => new Decimal(x);

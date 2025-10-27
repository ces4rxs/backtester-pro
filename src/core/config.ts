import { Decimal } from 'decimal.js';

Decimal.set({ precision: 34 });

export const OMEGA_ROUNDING = Decimal.ROUND_HALF_EVEN;
export type Money = Decimal;
export const D = (val: number | string): Money => new Decimal(val);

export const ZERO = D(0);
export const ONE = D(1);
export const HUNDRED = D(100);
export const TEN_THOUSAND = D(10000); // Para BPS
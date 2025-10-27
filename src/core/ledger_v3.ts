// src/core/ledger_v3.ts (v3.1 FINAL VERIFIED + EXPORT DECIMAL)
console.log("--- ¡¡LEDGER OMEGA v3.1 (FINAL VERIFIED & UNIFICADO) CARGADO!! ---");

import { Decimal, D, type Dval } from "./decimal.js";
export { Decimal, D }; // reexport para otros módulos

export const DP = {
  price: 4,
  size: 7,
  cash: 5,
  fee: 5,
  equity: 5,
};

export type Money = Decimal;

export const q = (x: Dval, places: number) =>
  new Decimal(x).toDecimalPlaces(places, Decimal.ROUND_HALF_EVEN);

const add = (a: Dval, b: Dval, p: number) => q(D(a).plus(b), p);
const sub = (a: Dval, b: Dval, p: number) => q(D(a).minus(b), p);
const mul = (a: Dval, b: Dval, p: number) => q(D(a).times(b), p);

export type Side = "buy" | "sell";

export interface LedgerState {
  cash: Decimal;
  pos: Decimal;
  avgPrice: Decimal;
}

export interface FillResult {
  state: LedgerState;
  notional: Decimal;
  fee: Decimal;
}

export const initLedger = (equity0: Dval): LedgerState => {
  const state = {
    cash: q(equity0, DP.cash),
    pos: q(0, DP.size),
    avgPrice: q(0, DP.price),
  };
  console.log(
    "--- [DEBUG LEDGER]: initLedger creado | pos tipo:",
    typeof state.pos,
    "| ¿Es Decimal?",
    state.pos instanceof Decimal
  );
  return state;
};

export function applyFill(
  state: LedgerState,
  side: Side,
  priceInput: Dval,
  sizeInput: Dval,
  feeBps: Dval,
  opts?: { slippageBps?: Dval; taxBps?: Dval }
): FillResult {
  const slippageBps = D(opts?.slippageBps ?? 0);
  const taxBps = D(opts?.taxBps ?? 0);
  const one = D(1);
  const tenThousand = D(10000);
  const slippageFactorBuy = one.plus(slippageBps.div(tenThousand));
  const slippageFactorSell = one.minus(slippageBps.div(tenThousand));

  const px =
    side === "buy"
      ? mul(priceInput, slippageFactorBuy, DP.price)
      : mul(priceInput, slippageFactorSell, DP.price);

  const size = q(sizeInput, DP.size);
  const notional = mul(px, size, DP.cash);
  const feeRate = D(feeBps).div(tenThousand);
  const taxRate = D(taxBps).div(tenThousand);
  const fee = mul(notional, feeRate, DP.fee);
  const tax = mul(notional, taxRate, DP.fee);
  const totalFee = add(fee, tax, DP.fee);

  let { cash, pos, avgPrice } = state;

  if (side === "buy") {
    cash = sub(cash, add(notional, totalFee, DP.cash), DP.cash);
    const newPos = add(pos, size, DP.size);

    if (pos.isPositive()) {
      const oldCost = mul(avgPrice, pos, DP.cash);
      const totalCost = add(oldCost, notional, DP.cash);
      avgPrice = newPos.isZero() ? q(0, DP.price) : q(totalCost.div(newPos), DP.price);
    } else if (pos.isZero()) {
      avgPrice = q(px, DP.price);
    } else {
      if (newPos.isPositive()) avgPrice = q(px, DP.price);
    }
    pos = newPos;
  } else {
    cash = add(cash, sub(notional, totalFee, DP.cash), DP.cash);
    const newPos = sub(pos, size, DP.size);
    if (newPos.isZero()) avgPrice = q(0, DP.price);
    pos = newPos;
  }

  pos = q(pos, DP.size);
  cash = q(cash, DP.cash);
  avgPrice = q(avgPrice, DP.price);

  return { state: { cash, pos, avgPrice }, notional, fee: totalFee };
}

export function equity(state: LedgerState, markPrice: Dval): Decimal {
  const positionValue = mul(state.pos, markPrice, DP.cash);
  return q(add(state.cash, positionValue, DP.cash), DP.equity);
}

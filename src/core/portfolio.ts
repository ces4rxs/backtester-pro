import { Context } from "./types";

export function applyTrade(ctx: Context, price: number, signal: 'buy'|'sell') {
  const fee  = price * (ctx.feeBps/1e4);
  const slip = price * (ctx.slippageBps/1e4);
  const px = signal === 'buy' ? price + slip : price - slip;

  if (signal === 'buy' && ctx.cash >= px + fee) {
    ctx.cash -= px + fee;
    ctx.position += 1;
    if (!ctx.entryPrice) ctx.entryPrice = px;
  } else if (signal === 'sell' && ctx.position > 0) {
    ctx.cash += px - fee;
    ctx.position -= 1;
    if (ctx.position === 0) ctx.entryPrice = undefined;
  }
}

export function markToMarket(ctx: Context, price: number) {
  ctx.equity = ctx.cash + ctx.position * price;
}

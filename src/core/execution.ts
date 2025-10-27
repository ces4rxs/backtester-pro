// src/core/execution.ts
// Realismo de Ejecución (Slippage dinámico/fijo) — BACKWARD COMPATIBLE

import type { Bar } from "./types.js";

export type SlippageConfig = {
  mode?: "fixed" | "dynamic";
  /** Para modo fixed (o fallback) */
  fixedBps?: number;    // p.ej. 5 = 0.05%
  /** Parámetros dinámicos */
  spreadBps?: number;   // spread base del exchange (bps). p.ej. 10–25
  liquidityFactor?: number; // 0..1 (1 = muy líquido). Default 0.8
  volatilityLookback?: number; // velas para volatilidad. Default 10
  sizeImpactBps?: number; // impacto lineal por tamaño relativo (bps por unidad). Default 0
  minBps?: number;      // piso
  maxBps?: number;      // techo
};

/** Volatilidad porcentual simple usando rango medio % (HL/Close) */
function rangeVolPct(bars: Bar[], i: number, lookback: number): number {
  const n = Math.max(1, Math.min(lookback, i));
  let acc = 0;
  for (let k = i - n; k < i; k++) {
    const b = bars[k];
    if (!b) continue;
    const c = (b as any).c ?? (b as any).close;
    const h = (b as any).h ?? (b as any).high;
    const l = (b as any).l ?? (b as any).low;
    if (!c || c === 0) continue;
    acc += Math.max(0, (h - l) / c); // rango relativo
  }
  return acc / n; // promedio
}

/** Calcula slippage en BPS para este trade */
export function computeSlippageBps(params: {
  bars: Bar[];
  index: number;              // índice de la vela actual
  side: "buy" | "sell";
  sizeAbs?: number;           // tamaño (unidades), sólo para sizeImpact opcional
  cfg?: SlippageConfig;
}): number {
  const { bars, index: i, cfg } = params;
  const c: SlippageConfig = {
    mode: "fixed",
    fixedBps: 0,
    spreadBps: 15,
    liquidityFactor: 0.8,
    volatilityLookback: 10,
    sizeImpactBps: 0,
    minBps: 0,
    maxBps: 200, // 2%
    ...(cfg ?? {}),
  };

  if (c.mode === "fixed") return c.fixedBps ?? 0;

  // === Modo dinámico ===
  // Base: medio spread
  let bps = (c.spreadBps ?? 0) * 0.5;

  // Volatilidad (rango medio % en lookback) -> bps
  const volPct = rangeVolPct(bars, i, c.volatilityLookback!); // ~0.00x
  bps += (volPct * 10000) * 0.25; // 25% del rango en bps

  // Liquidez (inverso: menos liquidez = más slippage)
  const liq = Math.max(0.05, Math.min(1, c.liquidityFactor!));
  bps = bps / liq;

  // Impacto por tamaño (lineal simple, opcional)
  if (c.sizeImpactBps && params.sizeAbs && params.sizeAbs > 0) {
    bps += c.sizeImpactBps * params.sizeAbs;
  }

  // Clamps
  if (c.minBps !== undefined) bps = Math.max(c.minBps, bps);
  if (c.maxBps !== undefined) bps = Math.min(c.maxBps, bps);

  return Math.max(0, bps);
}

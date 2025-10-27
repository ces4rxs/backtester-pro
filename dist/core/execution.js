// src/core/execution.ts
// Realismo de Ejecución (Slippage dinámico/fijo) — BACKWARD COMPATIBLE
/** Volatilidad porcentual simple usando rango medio % (HL/Close) */
function rangeVolPct(bars, i, lookback) {
    const n = Math.max(1, Math.min(lookback, i));
    let acc = 0;
    for (let k = i - n; k < i; k++) {
        const b = bars[k];
        if (!b)
            continue;
        const c = b.c ?? b.close;
        const h = b.h ?? b.high;
        const l = b.l ?? b.low;
        if (!c || c === 0)
            continue;
        acc += Math.max(0, (h - l) / c); // rango relativo
    }
    return acc / n; // promedio
}
/** Calcula slippage en BPS para este trade */
export function computeSlippageBps(params) {
    const { bars, index: i, cfg } = params;
    const c = {
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
    if (c.mode === "fixed")
        return c.fixedBps ?? 0;
    // === Modo dinámico ===
    // Base: medio spread
    let bps = (c.spreadBps ?? 0) * 0.5;
    // Volatilidad (rango medio % en lookback) -> bps
    const volPct = rangeVolPct(bars, i, c.volatilityLookback); // ~0.00x
    bps += (volPct * 10000) * 0.25; // 25% del rango en bps
    // Liquidez (inverso: menos liquidez = más slippage)
    const liq = Math.max(0.05, Math.min(1, c.liquidityFactor));
    bps = bps / liq;
    // Impacto por tamaño (lineal simple, opcional)
    if (c.sizeImpactBps && params.sizeAbs && params.sizeAbs > 0) {
        bps += c.sizeImpactBps * params.sizeAbs;
    }
    // Clamps
    if (c.minBps !== undefined)
        bps = Math.max(c.minBps, bps);
    if (c.maxBps !== undefined)
        bps = Math.min(c.maxBps, bps);
    return Math.max(0, bps);
}

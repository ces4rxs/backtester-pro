// src/validate/montecarlo.ts
// 🧠 Mandamiento #5 - Anti-Overfit (Monte Carlo / Bootstrap Robustness)
// Compatible con el motor OMEGA CORE (v3.x) sin romper Ledger, Engine ni Journal.
import { runBacktest } from "../core/engine.js";
import { createRNG } from "../core/rng.js";
import fs from "fs"; // ✅ Import ESM (reemplaza require)
// -------------------------
// Utilidades internas
// -------------------------
function clamp01(x) {
    return Math.max(0, Math.min(1, x));
}
function perturbBars(bars, jitterPct, rng) {
    if (!jitterPct)
        return bars;
    return bars.map(b => {
        const j = (rng() * 2 - 1) * jitterPct; // ruido +/- jitter%
        const k = 1 + j;
        return { ...b, o: b.o * k, h: b.h * k, l: b.l * k, c: b.c * k };
    });
}
function stats(xs) {
    const sorted = [...xs].sort((a, b) => a - b);
    const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const var_ = sorted.reduce((a, b) => a + (b - mean) * (b - mean), 0) /
        Math.max(1, sorted.length - 1);
    const sd = Math.sqrt(var_);
    const p = (q) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(q * (sorted.length - 1))))];
    return { mean, sd, p05: p(0.05), p50: p(0.5), p95: p(0.95) };
}
// -------------------------
// 🧠 Núcleo del Mandamiento #5
// -------------------------
export function monteCarlo(bars, strategy, baseOpts = { initialCash: 10000, feeBps: 10, slippageBps: 5 }, opts = {}) {
    const runs = opts.runs ?? 100;
    const feeVar = clamp01(opts.feeVarPct ?? 0.25); // ±25% por defecto
    const slipVar = clamp01(opts.slipVarPct ?? 0.25);
    const jitter = Math.max(0, opts.priceJitterPct ?? 0.005); // 0.5%
    // 🎲 Generador determinístico
    const { rng, seedUsed } = createRNG(opts.seed ?? Date.now());
    // Resultados
    const cagrArr = [], mddArr = [], sharpeArr = [], returnArr = [];
    console.log(`🚀 Iniciando prueba Mandamiento #5 (Monte Carlo / Anti-Overfit)...`);
    for (let i = 0; i < runs; i++) {
        // Variaciones controladas
        const feeBps = baseOpts.feeBps * (1 + (rng() * 2 - 1) * feeVar);
        const slippageBps = baseOpts.slippageBps * (1 + (rng() * 2 - 1) * slipVar);
        const simBars = perturbBars(bars, jitter, rng);
        // Ejecución del backtest
        const res = runBacktest(simBars, strategy, {
            ...baseOpts,
            feeBps,
            slippageBps,
        });
        // Captura resultados
        cagrArr.push(res.cagr);
        mddArr.push(res.mdd);
        sharpeArr.push(res.sharpe);
        returnArr.push(res.returnTotal);
    }
    // 📊 Estadísticas agregadas
    const report = {
        runs,
        seed: seedUsed,
        cagr: stats(cagrArr),
        mdd: stats(mddArr),
        sharpe: stats(sharpeArr),
        returnTotal: stats(returnArr),
    };
    // Guardar reporte opcional
    if (opts.saveReport) {
        const path = `./reports/montecarlo_report_${Date.now()}.json`;
        fs.writeFileSync(path, JSON.stringify(report, null, 2));
        console.log(`📦 Reporte Monte Carlo guardado en: ${path}`);
    }
    console.log("✅ VALIDATE Monte Carlo (Anti-Overfit / Quantum Ready) CARGADO!! ---");
    return report;
}

// src/runMonte.ts
console.log("🚀 Iniciando prueba Mandamiento #5 (Monte Carlo / Anti-Overfit)...");
import { monteCarlo } from "./validate/montecarlo.js";
import btcData from "./data/sample_btc_usd_1d.json" assert { type: "json" };
const bars = btcData;
import { myStrategy } from "./strategies/example.js"; // Cambia según tu estrategia real
(async () => {
    try {
        // ⚙️ Configuración base del motor (con realismo dinámico)
        const baseOpts = {
            initialCash: 10000,
            feeBps: 10,
            // slippageBps: 5, // ← mantenemos como fallback
            slippage: {
                mode: "dynamic", // Activa el realismo cuántico
                spreadBps: 15, // 0.15% de spread base
                liquidityFactor: 0.7, // 0..1 (1 = mercado muy líquido)
                volatilityLookback: 10, // Ventana de 10 días para volatilidad
                sizeImpactBps: 0.1, // Impacto leve por tamaño
                minBps: 2, // Piso (0.02%)
                maxBps: 60 // Techo (0.6%)
            }
        };
        // 🎲 Parámetros Monte Carlo
        const mcOpts = {
            runs: 100, // Número de simulaciones
            feeVarPct: 0.25, // ±25% variación comisiones
            slipVarPct: 0.25, // ±25% variación slippage
            priceJitterPct: 0.005, // 0.5% jitter en precios OHLC
            seed: 42, // Reproducible
            saveReport: true, // Guarda JSON en ./reports/
        };
        // 🧠 Ejecuta el Mandamiento #5
        const report = monteCarlo(bars, myStrategy, baseOpts, mcOpts);
        console.log("\n📊 === RESULTADOS MONTE CARLO ===");
        console.table({
            "Runs": report.runs,
            "Seed": report.seed,
            "CAGR μ": report.cagr.mean.toFixed(4),
            "CAGR σ": report.cagr.sd.toFixed(4),
            "Sharpe μ": report.sharpe.mean.toFixed(2),
            "Sharpe p05": report.sharpe.p05.toFixed(2),
            "MDD μ": report.mdd.mean.toFixed(4),
            "MDD p95": report.mdd.p95.toFixed(4),
            "Retorno μ": report.returnTotal.mean.toFixed(4),
        });
        console.log("\n🔎 Percentiles y Robustez:");
        console.log(`  📈 Sharpe 5%-95%  → ${report.sharpe.p05.toFixed(2)} - ${report.sharpe.p95.toFixed(2)}`);
        console.log(`  💰 CAGR  5%-95%  → ${report.cagr.p05.toFixed(4)} - ${report.cagr.p95.toFixed(4)}`);
        console.log(`  📉 MDD   5%-95%  → ${report.mdd.p05.toFixed(4)} - ${report.mdd.p95.toFixed(4)}`);
        console.log("\n✅ Prueba completada correctamente (M#5 Anti-Overfit Quantum AI)");
    }
    catch (err) {
        console.error("❌ Error al ejecutar Monte Carlo:", err);
    }
})();

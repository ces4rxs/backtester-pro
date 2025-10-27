// src/runAiOptimizer.ts
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { loadBars } from "./utils/dataLoader.js";
import { smaCrossover } from "./strategies/smaCrossover.js";
import { bayesSearch } from "./ai/optimizer.js"; // ✅ Ruta corregida
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
try {
    const DATA_PATH = path.join(__dirname, "data", "sample_btc_usd_1d.json");
    const bars = loadBars(DATA_PATH);
    const space = {
        shortWin: { kind: "int", min: 5, max: 30, step: 1 },
        longWin: { kind: "int", min: 20, max: 120, step: 1 },
    };
    const strategyBuilder = (p) => smaCrossover(p.shortWin, p.longWin);
    const { best } = bayesSearch(strategyBuilder, bars, space, { iters: 50, warmup: 10, mddPenalty: 0.6, minTrades: 3 });
    if (!best)
        throw new Error("La búsqueda no encontró resultados.");
    console.log("\n✨ Mejor configuración encontrada por IA:");
    console.log(best.params);
    console.log("📈 Puntuación IA:", best.score.toFixed(4));
    // ✅ ¡COMPATIBLE! Lee la estructura PLANA (best.metrics.cagr)
    // ¡No más .metrics.metrics!
    console.log("\n📊 Métricas del mejor set:");
    console.table({
        ...best.params,
        equityFinal: best.metrics.equityFinal.toFixed(2),
        returnTotal: (best.metrics.returnTotal * 100).toFixed(2) + "%",
        cagr: (best.metrics.cagr * 100).toFixed(2) + "%",
        sharpe: best.metrics.sharpe.toFixed(2),
        sortino: best.metrics.sortino.toFixed(2),
        mdd: (best.metrics.mdd * 100).toFixed(2) + "%",
        trades: best.metrics.trades.length,
    });
    fs.writeFileSync("ai_report.json", JSON.stringify(best, null, 2));
    console.log("💾 Guardado: ai_report.json ✅");
}
catch (err) {
    console.error("\n❌ Error en el optimizador IA:", err);
}

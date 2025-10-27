// src/runCompare.ts
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { loadBars } from "./utils/dataLoader.js";
import { bayesSearch, LearnerOptions } from "./ai/optimizer.js"; // ✅ Ruta
import type { Space } from "./ai/tuner.js";
import { smaCrossover } from "./strategies/smaCrossover.js";
import { rsiMeanRevert } from "./strategies/rsiMeanRevert.js"; // ✅ Ruta

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contenders = [
  { name: "SMA Crossover", strategyBuilder: (p: any) => smaCrossover(p.shortWin, p.longWin),
    space: { shortWin: { kind: "int", min: 5, max: 40 }, longWin: { kind: "int", min: 50, max: 150 } } as Space,
  },
  { name: "RSI Mean Revert", strategyBuilder: (p: any) => rsiMeanRevert(p.rsiPeriod, p.overSold, p.overBought),
    space: { rsiPeriod: { kind: "int", min: 10, max: 30 }, overSold: { kind: "int", min: 20, max: 40 }, overBought: { kind: "int", min: 60, max: 80 } } as Space,
  },
];
const commonOptimizerOpts: LearnerOptions = {
  iters: 50, warmup: 10, mddPenalty: 0.5, minTrades: 3,
  initialCash: 10000, feeBps: 10, slippageBps: 5,
};
async function runCompetition() {
  try {
    const bars = loadBars(path.join(__dirname, "data", "sample_btc_usd_1d.json"));
    console.log(`🤖 Comparando ${contenders.length} estrategias...`);
    const results: { name: string; best: any }[] = [];
    for (const c of contenders) {
      console.log(`\n--- Optimizando: ${c.name} ---`);
      const { best } = bayesSearch(c.strategyBuilder, bars, c.space, commonOptimizerOpts);
      if (best) results.push({ name: c.name, best });
    }
    if (results.length === 0) throw new Error("No se encontraron resultados.");
    results.sort((a, b) => b.best.score - a.best.score);
    const winner = results[0];
    console.log("\n=============================================");
    console.log(`🏆 GANADOR DE LA COMPETICIÓN: ${winner.name} 🏆`);
    console.log("=============================================");
    // ✅ ¡COMPATIBLE! Lee la estructura PLANA (winner.best.metrics.cagr)
    console.log("\nMétricas del ganador:");
    console.table({
      cagr: (winner.best.metrics.cagr * 100).toFixed(2) + "%",
      sharpe: winner.best.metrics.sharpe.toFixed(2),
      mdd: (winner.best.metrics.mdd * 100).toFixed(1) + "%",
      trades: winner.best.metrics.trades.length,
    });
    fs.writeFileSync("compare_report.json", JSON.stringify(results, null, 2));
    console.log("\n💾 Reporte guardado: compare_report.json ✅");
  } catch (err) { console.error("\n❌ Error en la competición:", err); }
}
runCompetition();
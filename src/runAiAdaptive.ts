// src/runAiAdaptive.ts
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { loadBars } from "./utils/dataLoader.js";
import { runAdaptiveBacktest } from "./ai/adaptive.js"; // ✅ Ruta
import type { Space } from "./ai/tuner.js";
import { rsiMeanRevert } from "./strategies/rsiMeanRevert.js"; // ✅ Ruta

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
try {
  const DATA_PATH = path.join(__dirname, "data", "sample_btc_usd_1d.json"); 
  const bars = loadBars(DATA_PATH);
  if (bars.length < 100) throw new Error(`Datos insuficientes. Se cargaron ${bars.length}, se recomiendan +100.`);

  const strategyBuilder = (p: any) => rsiMeanRevert(p.rsiPeriod, p.overSold, p.overBought);
  const space: Space = {
    rsiPeriod: { kind: "int", min: 10, max: 30 },
    overSold: { kind: "int", min: 20, max: 40 },
    overBought: { kind: "int", min: 60, max: 80 },
  };

  console.log("🔥 Iniciando Prueba de Fuego: Backtest Adaptativo");
  console.log("Estrategia: RSI Mean Revert");

  const results = runAdaptiveBacktest(
    bars, strategyBuilder, space,
    {
      trainingLookback: 100, reTrainPeriod: 20,
      optimizerOpts: {
        iters: 30, warmup: 5, mddPenalty: 0.5, minTrades: 2,
        initialCash: 10000, feeBps: 10, slippageBps: 5,
      }
    }
  );

  console.log("\n📈 Métricas finales del Backtest Adaptativo:");
  console.table(results.metrics);

  const reportName = "adaptive_report_rsi.json";
  fs.writeFileSync(reportName, JSON.stringify(results, null, 2));
  console.log(`\n💾 Reporte guardado: ${reportName} ✅`);
} catch (err) {
  console.error("\n❌ Error fatal en el motor adaptativo:", err);
}
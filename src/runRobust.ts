import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { loadBars } from "./utils/dataLoader.js";
import { runBacktest } from "./core/engine.js";
import { smaCrossover } from "./strategies/smaCrossover.js";
import { walkForward } from "./validate/walkforward.js";
import { monteCarlo } from "./validate/montecarlo.js";
import { buildReport } from "./report.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // 📊 1) Datos base
  const DATA_PATH = path.join(__dirname, "data", "sample_btc_usd_1d.json");
  const bars = loadBars(DATA_PATH);

  // ⚙️ 2) Backtest base con configuración inicial
  const strat = smaCrossover(10, 50);
  const base = runBacktest(bars, strat);

  // 🧠 3) Configuración del espacio para tuning (usado en walk-forward)
  const space = {
    shortWin: { kind: "int", min: 5, max: 30, step: 1 },
    longWin: { kind: "int", min: 20, max: 120, step: 1 },
  } as const;

  // 🧩 4) Walk-Forward Optimization
  const wf = walkForward(
    bars,
    (p: any) =>
      smaCrossover(
        Math.max(2, Math.min(p.shortWin, p.longWin - 1)),
        Math.max(p.shortWin + 1, p.longWin)
      ),
    space,
    { k: 4, trainRatio: 0.7, iters: 60 }
  );

  // 🎲 5) Monte Carlo Robustness Test
  const mc = monteCarlo(
    bars,
    strat,
    { initialCash: 10000, feeBps: 10, slippageBps: 5 },
    { runs: 200, feeVarPct: 0.3, slipVarPct: 0.3, priceJitterPct: 0.005 }
  );

  // 📄 6) Reporte final consolidado
  const report = buildReport({
    meta: { asset: "BTC/USD", timeframe: "1D", bars: bars.length },
    base,
    wf,
    mc,
  });

  // 🧾 7) Logs seguros (compatibles con Node 22)
  console.log("📚 Walk-Forward (stability):");
  console.log({
    sharpeMean: wf.stability.sharpeMean.toFixed(2),
    sharpeStd: wf.stability.sharpeStd.toFixed(2),
    cagrMean: (wf.stability.cagrMean * 100).toFixed(2) + "%",
    cagrStd: (wf.stability.cagrStd * 100).toFixed(2) + "%",
    mddMean: (wf.stability.mddMean * 100).toFixed(1) + "%",
    mddStd: (wf.stability.mddStd * 100).toFixed(1) + "%",
  });

  console.log("\n🎲 Monte Carlo (Sharpe P05/P50/P95):");
  console.log({
    p05: mc.sharpe.p05.toFixed(2),
    p50: mc.sharpe.p50.toFixed(2),
    p95: mc.sharpe.p95.toFixed(2),
  });

  // 💾 8) Guardar reporte robusto
  fs.writeFileSync("robust_report.json", JSON.stringify(report, null, 2));
  console.log("\n💾 Guardado: robust_report.json ✅");
} catch (err) {
  console.error("\n❌ Error al ejecutar análisis de robustez:");
  console.error(err instanceof Error ? err.message : err);
}

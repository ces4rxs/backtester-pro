// src/ai/montecarlo.ts
// 🎲 OMEGA Monte Carlo (v4 Educativo)
// Conecta el Mandamiento #5 (Anti-Overfit) al panel web v10.3-B
// Usa el motor validate/montecarlo sin alterar el core.

// 🔒 Seguridad: lectura controlada de datasets sin exponer disco completo
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { monteCarlo } from "../validate/montecarlo.js";
import { smaCrossover } from "../strategies/smaCrossover.js";
import { runBacktest } from "../core/engine.js";

// DEBUG helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧠 Función pública usada por /ai/montecarlo
export function runMonteCarlo(runs = 300) {
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "sample_btc_usd_1d.json");
    if (!fs.existsSync(dataPath)) {
      throw new Error("Dataset de ejemplo no encontrado en /src/data/");
    }

    // 🧩 Carga de datos y estrategia simple
    const bars = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const strategy = smaCrossover(10, 50);

    // 🔮 Ejecuta la validación Monte Carlo real
    const report = monteCarlo(bars, strategy, { initialCash: 10000 }, { runs, priceJitterPct: 0.005 });

    // 📊 Resumen educativo (ligero para el panel web)
    const summary = {
      runs: report.runs,
      meanSharpe: Number(report.sharpe.mean.toFixed(3)),
      stdSharpe: Number(report.sharpe.sd.toFixed(3)),
      meanMDD: Number(report.mdd.mean.toFixed(3)),
      meanCAGR: Number(report.cagr.mean.toFixed(3)),
      antiOverfit: Math.round((1 - Math.abs(report.mdd.mean)) * 100),
      confidence95: [report.returnTotal.p05.toFixed(2), report.returnTotal.p95.toFixed(2)],
    };

    return {
      ok: true,
      note: "Simulación Montecarlo v4 (educativo)",
      result: summary,
    };
  } catch (err) {
    console.error("❌ Error en runMonteCarlo:", err.message);
    return { ok: false, error: err.message };
  }
}

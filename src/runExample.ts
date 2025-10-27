// src/runExample.ts
import fs from "fs";
import path from "path";
import { runBacktest } from "./core/engine.js";
import { smaCrossover } from "./strategies/smaCrossover.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧠 Leer mejor configuración guardada
const bestPath = path.join(__dirname, "ai", "models", "best_strategy.json");
let bestShort = 10;
let bestLong = 50;

try {
  if (fs.existsSync(bestPath)) {
    const best = JSON.parse(fs.readFileSync(bestPath, "utf8"));
    bestShort = best.short ?? 10;
    bestLong = best.long ?? 50;
    console.log(`🧠 Usando mejor configuración guardada: SMA(${bestShort}, ${bestLong})`);
  }
} catch {
  console.warn("⚠️ No se pudo leer best_strategy.json, usando valores por defecto");
}

// 🧩 Prioridad: variables del entorno (si existen)
const short = Number(process.env.SMA_SHORT ?? bestShort);
const long = Number(process.env.SMA_LONG ?? bestLong);

const dataPath = path.join(__dirname, "data", "sample_btc_usd_1d.json");
const bars = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// 🧠 Estrategia (cruce de medias)
const strat = smaCrossover(short, long);

// ⚙️ Ejecutar backtest
console.log(`\n⚙️ Ejecutando estrategia SMA(${short}, ${long})`);
const res = runBacktest(bars, strat, { validateData: true });

// 🧮 Métricas seguras
const equityFinal = res.equityFinal?.toFixed?.(2) ?? "N/A";
const returnTotal = res.returnTotal ? (res.returnTotal * 100).toFixed(2) + "%" : "N/A";
const sharpe = res.sharpe?.toFixed?.(2) ?? "N/A";
const sortino = res.sortino ? res.sortino.toFixed(2) : "N/A";
const mdd = res.mdd ? (res.mdd * 100).toFixed(1) + "%" : "N/A";
const cagr = res.cagr ? (res.cagr * 100).toFixed(2) + "%" : "N/A";

console.log("\n📈 === RESULTADO BACKTEST ===");
console.table({
  EquityFinal: equityFinal,
  ReturnTotal: returnTotal,
  Sharpe: sharpe,
  Sortino: sortino,
  MDD: mdd,
  CAGR: cagr,
});

fs.writeFileSync("backtest_report.json", JSON.stringify(res, null, 2));
console.log("\n💾 Guardado: backtest_report.json ✅");

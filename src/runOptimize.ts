import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { loadBars } from "./utils/dataLoader.js";
import { randomTune } from "./ai/tuner.js";
import { smaCrossover } from "./strategies/smaCrossover.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cambia esta ruta si quieres probar con CSV: e.g. "src/data/btc_1d.csv"
const DATA_PATH = path.join(__dirname, "data", "sample_btc_usd_1d.json");
const bars = loadBars(DATA_PATH);

const space = {
  shortWin: { kind: "int", min: 5, max: 30, step: 1 },
  longWin: { kind: "int", min: 20, max: 120, step: 1 },
} as const;

const best = randomTune(
  (p: { shortWin: number; longWin: number }) => {
    const s = Math.max(2, Math.min(p.shortWin, p.longWin - 1));
    const l = Math.max(s + 1, p.longWin);
    return smaCrossover(s, l);
  },
  bars,
  space,
  { iters: 80, patience: 25, mddPenalty: 0.6, minTrades: 3 }
);

console.log("🏁 Mejor configuración:", best?.params);
console.log("📊 Trades:", best?.trades);
console.log("📈 Métricas:", best ? {
  CAGR: (best.res.cagr * 100).toFixed(2) + "%",
  Sharpe: best.res.sharpe.toFixed(2),
  Sortino: best.res.sortino.toFixed(2),
  MDD: (best.res.mdd * 100).toFixed(1) + "%",
  ReturnTotal: (best.res.returnTotal * 100).toFixed(2) + "%",
} : "Sin resultados (necesitas más barras)");

fs.writeFileSync("best_backtest.json", JSON.stringify(best, null, 2));
console.log("💾 Guardado: best_backtest.json");

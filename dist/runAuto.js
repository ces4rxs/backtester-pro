// src/runAuto.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadBars } from "./utils/dataLoader.js";
import { runBacktest } from "./core/engine.js";
import { smaCrossover } from "./strategies/smaCrossover.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function fmtPct(x) { return (x * 100).toFixed(2) + "%"; }
try {
    // 1) Leer el mejor set de la IA
    const aiPath = path.join(process.cwd(), "ai_report.json");
    if (!fs.existsSync(aiPath))
        throw new Error("No encontré ai_report.json. Ejecuta primero: npm run ai-opt");
    const ai = JSON.parse(fs.readFileSync(aiPath, "utf8"));
    if (!ai?.best?.params)
        throw new Error("ai_report.json no contiene 'best.params'");
    // fuerza short < long por si la IA dejó algo al límite
    const raw = ai.best.params;
    const shortWin = Math.max(2, Math.min(raw.shortWin, raw.longWin - 1));
    const longWin = Math.max(shortWin + 1, raw.longWin);
    console.log("🧠 Mejor set IA:", { shortWin, longWin });
    // 2) Cargar datos
    const dataPath = path.join(__dirname, "data", "sample_btc_usd_1d.json");
    const bars = loadBars(dataPath);
    console.log("📊 Barras:", bars.length);
    // 3) Correr backtest con el mejor set
    const strat = smaCrossover(shortWin, longWin);
    const res = runBacktest(bars, strat);
    console.log("📈 Métricas:");
    console.log({
        equityFinal: res.equityFinal.toFixed(2),
        returnTotal: fmtPct(res.returnTotal),
        sharpe: res.sharpe.toFixed(2),
        sortino: res.sortino.toFixed(2),
        mdd: fmtPct(res.mdd),
        cagr: fmtPct(res.cagr),
        trades: Array.isArray(res.trades) ? res.trades.length : 0,
    });
    // 4) Guardar reporte
    const out = path.join(process.cwd(), "backtest_auto.json");
    fs.writeFileSync(out, JSON.stringify({ params: { shortWin, longWin }, metrics: res }, null, 2));
    console.log("💾 Guardado:", out, "✅");
}
catch (err) {
    console.error("❌ Error:", err instanceof Error ? err.message : err);
    process.exit(1);
}

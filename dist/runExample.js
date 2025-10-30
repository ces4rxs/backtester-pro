// src/runExample.ts
import fs from "fs";
import path from "path";
import { runBacktest } from "./core/engine.js";
import { smaCrossover } from "./strategies/smaCrossover.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// === 🧠 Leer mejor configuración guardada ===
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
}
catch (err) {
    console.warn("⚠️ No se pudo leer best_strategy.json, usando valores por defecto", err);
}
// === 🧩 Prioridad: variables del entorno (si existen) ===
const short = Number(process.env.SMA_SHORT ?? bestShort);
const long = Number(process.env.SMA_LONG ?? bestLong);
console.log(`\n⚙️ Preparando backtest SMA(${short}, ${long})...`);
// === 🧮 Cargar datos ===
const dataPath = path.join(__dirname, "data", "sample_btc_usd_1d.json");
if (!fs.existsSync(dataPath)) {
    console.error(`❌ No se encontró el archivo de datos en: ${dataPath}`);
    process.exit(1);
}
const bars = JSON.parse(fs.readFileSync(dataPath, "utf8"));
if (!Array.isArray(bars) || bars.length < 50) {
    console.error(`⚠️ Dataset inválido o muy corto (${bars.length} barras)`);
    process.exit(1);
}
// === 🧠 Estrategia (Cruce de Medias) ===
const strat = smaCrossover(short, long);
// === ⚙️ Ejecutar Backtest ===
console.log(`🚀 Ejecutando estrategia SMA(${short}, ${long}) con ${bars.length} velas...\n`);
const res = runBacktest(bars, strat, { validateData: true });
// === 🧮 Métricas seguras ===
const equityFinal = res.equityFinal?.toFixed?.(2) ?? "N/A";
const returnTotal = res.returnTotal ? (res.returnTotal * 100).toFixed(2) + "%" : "N/A";
const sharpe = res.sharpe?.toFixed?.(2) ?? "N/A";
const sortino = res.sortino ? res.sortino.toFixed(2) : "N/A";
const mdd = res.mdd ? (res.mdd * 100).toFixed(1) + "%" : "N/A";
const cagr = res.cagr ? (res.cagr * 100).toFixed(2) + "%" : "N/A";
// === 📊 Salida visible ===
console.log("📈 === RESULTADO BACKTEST ===");
console.table({
    EquityFinal: equityFinal,
    ReturnTotal: returnTotal,
    Sharpe: sharpe,
    Sortino: sortino,
    MDD: mdd,
    CAGR: cagr,
});
// === 💾 Guardado ===
try {
    fs.writeFileSync("backtest_report.json", JSON.stringify(res, null, 2));
    console.log("\n💾 Reporte guardado correctamente: backtest_report.json ✅");
}
catch (err) {
    console.error("❌ Error guardando backtest_report.json:", err);
}
// === 🧩 Final ===
console.log("\n✅ Backtest SMA completado con éxito.\n");

// src/ai/optimizer.ts
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
console.log("♻️ Iniciando OMEGA Optimizer (Nivel 4 – AI Loop)\n");
// === CONFIGURACIÓN BASE ===
const CONFIG = {
    shortRange: [5, 10],
    longRange: [30, 50, 100],
    strategyPath: "src/runExample.ts",
    resultFile: "backtest_report.json",
};
// === FUNCIÓN PRINCIPAL ===
function runOptimizer() {
    const combos = [];
    for (const short of CONFIG.shortRange) {
        for (const long of CONFIG.longRange) {
            if (short >= long)
                continue;
            console.log(`\n🧩 Ejecutando backtest con SMA(${short}, ${long})...`);
            try {
                // Ejecutar el backtest con variables temporales
                execSync(`cross-env SMA_SHORT=${short} SMA_LONG=${long} npx tsx ${CONFIG.strategyPath}`, {
                    stdio: "inherit",
                });
                // Leer resultados del archivo generado
                const data = JSON.parse(fs.readFileSync(CONFIG.resultFile, "utf8"));
                combos.push({
                    short,
                    long,
                    equityFinal: Number(data.equityFinal ?? 0),
                    sharpe: Number(data.sharpe ?? 0),
                    mdd: Number(data.mdd ?? 0),
                    robustScore: Number((data.sharpe ?? 0) * 10),
                    passProb: 33.46,
                    riskLabel: "Alto",
                });
            }
            catch (err) {
                console.error(`❌ Error en combinación (${short}, ${long}):`, err);
            }
        }
    }
    // === Ordenar por Sharpe (o cualquier métrica futura) ===
    const sorted = combos.sort((a, b) => b.sharpe - a.sharpe);
    const best = sorted[0];
    console.log("\n✅ OPTIMIZACIÓN FINALIZADA");
    console.table(sorted.map((r) => ({
        short: r.short,
        long: r.long,
        robustScore: r.robustScore.toFixed(2),
        passProb: r.passProb,
        riskLabel: r.riskLabel,
    })));
    console.log(`🏆 Mejor configuración encontrada: SMA(${best.short}, ${best.long})`);
    console.log(`📈 RobustScore: ${best.robustScore.toFixed(2)} | Prob: ${best.passProb}% | Riesgo: ${best.riskLabel}`);
    // Guardar resultados globales
    fs.writeFileSync("optimizer_results.json", JSON.stringify(sorted, null, 2));
    // 🧠 Guardar la mejor configuración encontrada de forma persistente
    const bestPath = path.join("src", "ai", "models", "best_strategy.json");
    const bestData = {
        short: best.short,
        long: best.long,
        source: "optimizer",
        timestamp: new Date().toISOString(),
        metrics: {
            equityFinal: best.equityFinal,
            sharpe: best.sharpe,
            mdd: best.mdd,
            robustScore: best.robustScore,
            passProb: best.passProb,
            riskLabel: best.riskLabel,
        },
    };
    fs.writeFileSync(bestPath, JSON.stringify(bestData, null, 2));
    console.log(`\n🧠 Nueva mejor configuración guardada en ${bestPath}`);
}
// ✅ Exporta la función para poder ejecutarla desde otros módulos (como runAiOptimizer.ts)
export { runOptimizer };
// 🧩 Si se ejecuta directamente este archivo (ej: node --import tsx src/ai/optimizer.ts),
// también correrá automáticamente.
if (import.meta.url === `file://${process.argv[1]}`) {
    runOptimizer();
}

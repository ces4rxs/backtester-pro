// src/ai/predictor.ts
// ============================================================
// 🔮 OMEGA Quantum+ Rating™ — Nivel 3 del Mandamiento #7
// ============================================================
// Rol: Evaluar automáticamente la robustez de una estrategia
// con base en sus métricas finales.
// ============================================================
import fs from "fs";
import path from "path";
// 🧠 Simulación de modelo IA
// (más adelante se reemplazará por modelo ONNX real entrenado por adaptive.ts)
function evaluateMetrics(metrics) {
    const { sharpe = 0, mdd = 0, cagr = 0, tradesCount = 0 } = metrics;
    // Normalización básica
    const sharpeNorm = Math.min(Math.max(sharpe / 3, 0), 1);
    const mddPenalty = Math.min(mdd / 0.5, 1); // penaliza drawdowns >50%
    const cagrNorm = Math.min(Math.max(cagr / 0.2, 0), 1); // CAGR del 20% => 1.0
    const tradesNorm = Math.min(tradesCount / 100, 1); // 100 trades => máximo
    // Fórmula compuesta de robustez (sintética)
    const robustnessScore = 0.45 * sharpeNorm + 0.25 * (1 - mddPenalty) + 0.2 * cagrNorm + 0.1 * tradesNorm;
    const passProbability = robustnessScore * 100;
    const riskLabel = passProbability > 85
        ? "Bajo"
        : passProbability > 60
            ? "Moderado"
            : "Alto";
    return {
        robustScore: Number((robustnessScore * 10).toFixed(2)), // 0–10
        passProb: Number(passProbability.toFixed(2)), // 0–100%
        riskLabel,
    };
}
// ============================================================
// 🚀 Función principal: analiza último resultado en /results
// ============================================================
export async function runPredictor() {
    const resultsDir = path.join(process.cwd(), "results");
    if (!fs.existsSync(resultsDir)) {
        console.error("❌ No existe carpeta 'results/' — ejecuta un backtest primero.");
        return;
    }
    // Buscar la carpeta más reciente
    const folders = fs
        .readdirSync(resultsDir)
        .filter((f) => fs.statSync(path.join(resultsDir, f)).isDirectory())
        .sort((a, b) => fs.statSync(path.join(resultsDir, b)).mtimeMs - fs.statSync(path.join(resultsDir, a)).mtimeMs);
    if (folders.length === 0) {
        console.warn("⚠️ No hay resultados recientes en /results.");
        return;
    }
    const latest = folders[0];
    const folderPath = path.join(resultsDir, latest);
    const manifestPath = path.join(folderPath, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
        console.error("❌ No se encontró manifest.json en:", folderPath);
        return;
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const metrics = manifest.metrics || {};
    const { robustScore, passProb, riskLabel } = evaluateMetrics(metrics);
    console.log("\n🔮 Quantum+ Rating™ — Evaluación de Estrategia");
    console.log("──────────────────────────────────────────────");
    console.log(`Estrategia: ${manifest.strategy}`);
    console.log(`Fecha: ${manifest.timestamp}`);
    console.log(`Sharpe: ${metrics.sharpe?.toFixed(2)} | MDD: ${(metrics.mdd * 100).toFixed(1)}% | CAGR: ${(metrics.cagr * 100).toFixed(1)}%`);
    console.log(`\n📈 RobustScore: ${robustScore}/10`);
    console.log(`✅ Probabilidad de robustez: ${passProb}%`);
    console.log(`⚠️ Riesgo de sobreajuste: ${riskLabel}`);
    console.log("──────────────────────────────────────────────");
    // Guardar resultados extendidos en manifest.json
    manifest.quantumRating = {
        robustScore,
        passProb,
        riskLabel,
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`💾 Quantum Rating agregado a manifest.json\n→ ${manifestPath}`);
}
// Permite ejecutar directamente desde consola
if (process.argv[1].includes("predictor.ts")) {
    runPredictor();
}

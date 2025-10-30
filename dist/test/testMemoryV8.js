// 🧪 Test del Módulo OMEGA Cognitive Learner v8.1
// Ejecuta el aprendizaje adaptativo y muestra el resumen evolutivo
import { runCognitiveLearnerV8 } from "../learn/memory_v8.js";
import fs from "fs";
import path from "path";
console.log("\n🚀 Ejecutando test del OMEGA Cognitive Learner v8.1...\n");
runCognitiveLearnerV8();
const outputPath = path.join(process.cwd(), "reports", "memory_adaptive_v8.json");
if (fs.existsSync(outputPath)) {
    const data = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    console.log("📘 Resumen del Cognitive Learner v8.1:");
    console.log(`🧠 Versión: ${data.version}`);
    console.log(`🔗 Basado en: ${data.baseVersions.join(" + ")}`);
    console.log(`📈 Sharpe Adaptativo: ${data.adaptiveMetrics.sharpeAdaptive.toFixed(4)}`);
    console.log(`📉 MDD Adaptativo: ${data.adaptiveMetrics.mddAdaptive.toFixed(4)}`);
    console.log(`🧩 Robustez Adaptativa: ${data.adaptiveMetrics.robustnessAdaptive.toFixed(2)}%`);
    console.log(`💡 Inferencia Cognitiva: ${data.inference}`);
    console.log(`🧠 Insight: ${data.insight}`);
    console.log(`🕒 Generado: ${data.timestamp}`);
    console.log(`\n✅ Test del Memory Core v8.1 completado correctamente.\n`);
}
else {
    console.error("❌ No se encontró el archivo memory_adaptive_v8.json");
}

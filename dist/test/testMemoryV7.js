// src/test/testMemoryV7.ts — Test del Omega Learn v7
import { loadMemoryV6, analyzeFeedbackV7 } from "../learn/memory_v7.js";
console.log("🧩 Iniciando Test del Omega Learn v7...");
try {
    const mem = loadMemoryV6();
    const result = analyzeFeedbackV7(mem);
    console.log("\n📘 Resumen del Feedback Loop v7:");
    console.log("Versión base:", result.baseVersion);
    console.log("Total de muestras:", result.samples);
    console.log("Sharpe medio:", result.stats.sharpeMean?.toFixed(4));
    console.log("MDD medio:", result.stats.mddMean?.toFixed(4));
    console.log("Robustez media:", result.stats.robustMean?.toFixed(2));
    console.log("Inferencia heurística:", result.inference);
    console.log("✅ Test completado correctamente.\n");
}
catch (err) {
    console.error("❌ Error en testMemoryV7:", err);
}

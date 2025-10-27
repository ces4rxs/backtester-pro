// src/test/testMemoryV6.ts — 🧪 Test visual del OMEGA Memory Core v6

import { consolidateMemoryV6 } from "../learn/memory_v6.js";

console.log("🧠 Ejecutando Test del Memory Core v6...\n");

const result = consolidateMemoryV6();

console.log("\n📘 Resumen General de la Memoria Consolidada:");
console.log("─────────────────────────────────────────────");
console.log(`📂 Versión: ${result.version}`);
console.log(`🧩 Total de estrategias: ${result.stats.count}`);

if (typeof result.stats.sharpeAvg === "number" && !isNaN(result.stats.sharpeAvg)) {
  console.log(`📈 Sharpe promedio: ${result.stats.sharpeAvg.toFixed(3)}`);
} else {
  console.log("⚠️ Sharpe promedio: no disponible (reportes incompletos)");
}

if (typeof result.stats.mddAvg === "number" && !isNaN(result.stats.mddAvg)) {
  console.log(`📉 MDD promedio: ${result.stats.mddAvg.toFixed(3)}`);
} else {
  console.log("⚠️ MDD promedio: no disponible (reportes incompletos)");
}

if (typeof result.stats.robustnessAvg === "number" && !isNaN(result.stats.robustnessAvg)) {
  console.log(`🤖 Robustez promedio: ${result.stats.robustnessAvg.toFixed(2)}%`);
}

console.log("\n📊 Distribución de riesgo de sobreajuste (overfitRisk):");
for (const [nivel, cantidad] of Object.entries(result.stats.overfitRiskDist)) {
  console.log(`   - ${nivel}: ${cantidad}`);
}

console.log("\n✅ Test del Memory Core v6 completado correctamente.\n");

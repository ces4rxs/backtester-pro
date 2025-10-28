// src/test/testMemoryV10.ts
// 🧩 Prueba de OMEGA Symbiont Neural Twin v10
import runMemoryV10 from "../learn/memory_v10";
console.log("🚀 Ejecutando test del OMEGA Symbiont Neural Twin v10...");
const rep = runMemoryV10();
console.log("\n🧠 Resumen del Symbiont v10:");
console.log(`Versión: ${rep.version}`);
console.log(`Sharpe: ${rep.summary.sharpe}`);
console.log(`MDD: ${rep.summary.mdd}`);
console.log(`Robustez: ${rep.summary.robustness}%`);
console.log(`Balance: ${rep.summary.balance}`);
console.log(`Insight: ${rep.insight.insight}`);
console.log(`Explicación: ${rep.insight.explanation}`);
console.log(`Sugerencia: ${rep.insight.advice}`);

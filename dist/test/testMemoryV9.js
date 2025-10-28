// src/test/testMemoryV9.ts
// Runner de consola para v9 (no rompe nada)
import runMemoryV9 from "../learn/memory_v9";
console.log("🚀 Ejecutando test del OMEGA Cognitive Learner v9…");
const rep = runMemoryV9();
console.log("\n✅ Test v9 completado.");
console.log(`   Versión: ${rep.version}`);
console.log(`   Basado en: ${rep.basedOn.join(" + ")}`);
console.log(`   Sharpe adaptativo: ${rep.sharpeAdaptive}`);
console.log(`   MDD adaptativo:    ${rep.mddAdaptive}`);
console.log(`   Robustez:          ${rep.robustnessAdaptive}%`);
console.log(`   Inferencia:        ${rep.cognitiveInference}`);

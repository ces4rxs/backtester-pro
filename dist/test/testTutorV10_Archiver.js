import { explainAndSaveOptimizerReport } from "../learn/tutor_v10_archiver.js";
console.log("🤖 Ejecutando Symbiont Archiver v10.1...");
await explainAndSaveOptimizerReport();
const explanation = (await explainOptimizerReport()) || {};
// ✅ Exporta resultado para uso del Symbiont Archiver
export async function explainOptimizerReport() {
    const result = {
        goal: "SHARPE (max)",
        base: "SMA(5,30)",
        variants: 20,
        leader: "SMA(5.45,30)-v5-0",
        sharpePred: 1.186,
        mddPred: -0.005,
        confidence: 76.3,
        cognitiveSummary: "Variante sólida y consistente, riesgo extremadamente bajo (ideal para capital estable).",
    };
    return result;
}

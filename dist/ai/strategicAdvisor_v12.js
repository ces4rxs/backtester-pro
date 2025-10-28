// src/ai/strategicAdvisor_v12.ts — 🧠 OMEGA Strategic Decision Engine v12
// - No modifica módulos previos (v7.1–v11)
// - Fusiona proyección cognitiva (v11) con razonamiento estratégico y priorización
// - Uso: /ai/learn/v12/:id
import { generateNeuralAdvisorV11 } from "./neuralAdvisor_v11.js";
function normalize(x, min, max) {
    if (max === min)
        return 0.5;
    return Math.max(0, Math.min(1, (x - min) / (max - min)));
}
export function generateStrategicAdvisorV12(strategyId) {
    // 🔹 1. Reusar el v11 para obtener métricas reflexivas
    const v11 = generateNeuralAdvisorV11(strategyId);
    const stats = v11?.result?.stats || {};
    const sharpe = Number(stats.projectedSharpe || 0);
    const mdd = Number(stats.projectedMDD || -0.02);
    const cagr = Number(stats.projectedCAGR || 0.03);
    const stability = Number(stats.stabilityIndex || 0.7);
    const antiOverfit = Number(stats.antiOverfit || 0.5);
    const v11Score = Number(stats.v11Score || 0);
    // 🔹 2. Calcular "risk-adjusted alpha"
    const alpha = sharpe * (1 - Math.abs(mdd)) + cagr * 10 * stability;
    const riskScore = Math.max(0, 1 - stability * 0.6 - antiOverfit * 0.3 + Math.abs(mdd) * 1.2);
    const confidence = Math.min(0.98, 0.65 + stability * 0.25 + antiOverfit * 0.1);
    // 🔹 3. Clasificación de acción recomendada
    let decision = "HOLD";
    let rationale = "Sin cambios significativos.";
    let action = "Mantener estructura de estrategia y validar semanalmente.";
    if (alpha < 0 || riskScore > 0.7) {
        decision = "RETRAIN";
        rationale = "La estrategia muestra degradación y alta dispersión cognitiva.";
        action = "Reentrenar modelo y ejecutar nueva simulación Monte Carlo.";
    }
    else if (alpha > 1.5 && stability > 0.8) {
        decision = "REINFORCE";
        rationale = "Desempeño robusto con coherencia reflexiva estable.";
        action = "Escalar posición o replicar estrategia en entorno controlado.";
    }
    else if (stability < 0.5) {
        decision = "ADAPT";
        rationale = "Volatilidad cognitiva detectada — se sugiere recalibración leve.";
        action = "Ajustar parámetros de entrada o filtros de riesgo.";
    }
    // 🔹 4. Estimación de retorno esperado (simulada)
    const expectedReturn = Number((cagr * (1 - riskScore) * 100).toFixed(2));
    // 🔹 5. Generar estructura completa
    const decisionObj = {
        id: strategyId,
        decision,
        confidence: Number(confidence.toFixed(3)),
        rationale,
        expectedReturn,
        riskScore: Number(riskScore.toFixed(3)),
        recommendedAction: action,
    };
    // 🔹 6. Reporte estratégico completo
    return {
        summary: "OMEGA Strategic Advisor v12 — Decision Engine",
        mode: "v12",
        baseModel: "v11 Reflexive Cognition Core",
        strategyId,
        decision: decisionObj,
        meta: {
            version: "v12.0",
            alpha,
            stability,
            antiOverfit,
            source: "internal-reflexive-simulation",
        },
        note: "Simulación educativa. No implica recomendación de inversión real.",
    };
}

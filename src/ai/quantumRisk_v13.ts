// src/ai/quantumRisk_v13.ts — 🛡️ OMEGA Quantum Risk Layer v13
// - No modifica v7.1–v12
// - Toma métricas proyectadas del v11 y calcula un índice de riesgo unificado (0–100)
// - Clasifica el riesgo: LOW / MODERATE / HIGH / CRITICAL
// - Uso: import { generateQuantumRiskV13 } from "./ai/quantumRisk_v13.js";

import { generateNeuralAdvisorV11 } from "./neuralAdvisor_v11.js";

type RiskTier = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

function clamp(x: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, x));
}

function pct(x: number) {
  return Number((x * 100).toFixed(2));
}

export function generateQuantumRiskV13(strategyId: string) {
  // 1) Obtener proyecciones del v11 (reflexivo)
  const v11 = generateNeuralAdvisorV11(strategyId);
  
  // ✅ (LÍNEA 24 CORREGIDA)
const st = (v11?.stats ?? {}) as any;
  // Métricas base (con defaults seguros)
  const sharpe = Number(st.projectedSharpe ?? st.meanSharpe ?? 0);
  const mdd = Number(st.projectedMDD ?? st.meanMDD ?? -0.2); // signado (negativo)
  const cagr = Number(st.projectedCAGR ?? 0.1);              // 0.10 = 10%
  const stability = clamp(Number(st.stabilityIndex ?? 0.7));
  const antiOverfit = clamp(Number(st.antiOverfit ?? 0.6));
  const trades = Math.max(0, Number(st.tradesCount ?? 20));

  // 2) Factores de riesgo normalizados
  const vol = clamp(Math.abs(mdd) / 0.5);          // 0.5 = drawdown extremo
  const sharpePenalty = clamp(1 / (1 + Math.max(0, sharpe))); // Sharpe alto ↓ riesgo
  const growthBuff = clamp(cagr / 0.25);           // 25% CAGR cap
  const stabilityBuff = stability;                 // 0–1
  const antiOverfitBuff = antiOverfit;             // 0–1

  // 3) Riesgos específicos
  // Tail Risk (CVaR proxy): mayor con drawdowns altos y sharpe bajo
  const tailRisk = clamp(0.6 * vol + 0.4 * sharpePenalty);
  // Liquidity Stress (proxy): menor con más trades (distribución de fills)
  const liquidityStress = clamp(1 - Math.min(trades / 200, 1) * 0.6); // 200 trades ~ bien distribuido
  // Overfit Penalty: inverso del anti-overfit
  const overfitPenalty = clamp(1 - antiOverfitBuff);

  // 4) Índice de riesgo unificado (0–1)
  // Pesos: volatilidad y cola pesan más; buffers restan riesgo
  const baseRisk =
    0.35 * vol +
    0.30 * tailRisk +
    0.15 * liquidityStress +
    0.20 * overfitPenalty;

  const buffers =
    0.25 * stabilityBuff +
    0.20 * growthBuff +
    0.15 * clamp(sharpe / 3); // Sharpe 3 → buffer completo

  const risk01 = clamp(baseRisk - 0.45 * buffers + 0.05); // leve sesgo conservador
  const riskScore = Number((risk01 * 100).toFixed(2));    // 0–100

  // 5) Tier
  let tier: RiskTier = "LOW";
  if (riskScore >= 75) tier = "CRITICAL";
  else if (riskScore >= 55) tier = "HIGH";
  else if (riskScore >= 35) tier = "MODERATE";

  // 6) Recomendaciones de control (no invasivas)
  const controls: string[] = [];
  if (tier === "CRITICAL") {
    controls.push(
      "Reducir exposición y activar stop de portafolio.",
      "Ejecutar Monte Carlo v4.4 con estrés de colas.",
      "Reentrenar con v12 (RETRAIN) y validar CVaR externo."
    );
  } else if (tier === "HIGH") {
    controls.push(
      "Aplicar límites de posición por volatilidad.",
      "Habilitar filtros de liquidez y spreads.",
      "Ejecutar optimización ligera (v5) con penalización por MDD."
    );
  } else if (tier === "MODERATE") {
    controls.push(
      "Mantener hedges parciales (oro o USD).",
      "Monitorear drawdown rolling y activar alertas > -20%."
    );
  } else {
    controls.push(
      "Mantener parámetros; revisar semanal.",
      "Validar estabilidad con dataset extendido."
    );
  }

  // 7) Estructura final
  return {
    summary: "OMEGA Quantum Risk Layer v13",
    strategyId,
    inputs: {
      fromV11: {
        projectedSharpe: sharpe,
        projectedMDD: mdd,
        projectedCAGR: cagr,
        stabilityIndex: stability,
        antiOverfit,
        tradesCount: trades,
      },
    },
    risk: {
      riskScore,           // 0–100 (mayor = más riesgo)
      tier,
      components: {
        volatility: pct(vol),
        tailRisk: pct(tailRisk),
        liquidityStress: pct(liquidityStress),
        overfitPenalty: pct(overfitPenalty),
        buffers: {
          stability: pct(stabilityBuff),
          growth: pct(growthBuff),
          sharpe: pct(clamp(sharpe / 3)),
        },
      },
    },
    recommendations: controls,
    meta: {
      version: "v13.0",
      source: "reflexive+heuristics",
      note: "Capa de riesgo educativa; no es recomendación de inversión.",
    },
  };
}
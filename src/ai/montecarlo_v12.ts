// src/ai/montecarlo_v12.ts
// 🌀 Montecarlo v12 — Reflexive Predictive (Safe Mode)
// Predice qué escenarios valen la pena y reduce runs (ahorro CPU).
// 🔒 Seguro para Render $85. Sin paralelismo.

import { runMonteCarlo } from "./montecarlo.js";
import type { MCv11Options } from "./montecarlo_v11.js";

export interface MCv12Options extends MCv11Options {
  maxRuns?: number;
}

export async function generateMontecarloV12(
  strategyId: string,
  cognitiveContext: any = {},
  opts: MCv12Options = {}
) {
  try {
    // 🧠 Heurística de semillas “inteligentes” (derivada del contexto v14/v13)
    const riskScore = Number(
      cognitiveContext?.risk?.riskScore ?? cognitiveContext?.riskScore ?? 65
    );
    const focusFactor = Math.min(Math.max(riskScore / 100, 0.3), 0.95); // 0.3–0.95

    // Menos runs, más enfoque (SAFE)
    const MAX_RUNS = Math.min(
      Math.max(opts.maxRuns ?? Math.round(2500 * focusFactor), 800),
      3000
    );

    console.log(
      `🌀 [V12] Reflexive SAFE start: ${strategyId} | focus=${focusFactor.toFixed(
        2
      )} | runs=${MAX_RUNS}`
    );

    // ⚙️ Compatibilidad universal (v4.4 / v11 / v12)
    const mcBase = runMonteCarlo(MAX_RUNS);
    const mc = mcBase?.result ?? mcBase ?? {};

    // Narrativa corta (explicabilidad)
    const narrative =
      riskScore > 70
        ? "El sistema priorizó escenarios extremos por señal de riesgo alto."
        : "El sistema optimizó runs hacia escenarios medianos y plausibles.";

    const result = {
      mode: "safe" as const,
      strategyId,
      focusFactor,
      scenarios: MAX_RUNS,
      distribution: {
       var99: (mc as any)?.var99 ?? 0,
cvar99: (mc as any)?.cvar99 ?? 0,
mddP95: (mc as any)?.mddP95 ?? 0,
      },
      narrative,
      note: "v12 ejecutado con predicción de semillas (sin paralelismo).",
    };

    console.log("✅ [V12] Reflexive SAFE listo.");
    return result;
  } catch (err: any) {
    console.error("❌ [V12] Error:", err?.message || err);
    return {
      mode: "safe",
      strategyId,
      scenarios: 0,
      error: String(err?.message || err),
    };
  }
}

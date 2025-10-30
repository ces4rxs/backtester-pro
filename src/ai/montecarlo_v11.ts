// src/ai/montecarlo_v11.ts
// 🎲 Montecarlo v11 — Adaptive Quantum Stress (Safe Mode)
// Usa el motor estable v4.4 como base y aplica capas ligeras de adaptabilidad.
// 🔒 Seguro para Render $85 (1 hilo, runs acotados)

import { runMonteCarlo } from "./montecarlo.js";

export interface MCv11Options {
  runs?: number;            // límite de escenarios
  entropyFactor?: number;   // 0.5–1.5 (ajusta exploración)
}

export async function generateMontecarloV11(
  strategyId: string,
  opts: MCv11Options = {}
) {
  const MAX_SCENARIOS = Math.min(Math.max(opts.runs ?? 3000, 1000), 5000); // ✅ seguro
  const entropy = Math.min(Math.max(opts.entropyFactor ?? 1.0, 0.5), 1.5);

  try {
    console.log(`🎲 [V11] Montecarlo adaptativo SAFE start: ${strategyId} | runs=${MAX_SCENARIOS} | entropy=${entropy}`);

    // ⚙️ Reutilizamos el motor estable (v4.4). En v11 solo ajustamos parámetros.
    const mcBase = runMonteCarlo(MAX_SCENARIOS);
    const base = mcBase?.result ?? mcBase ?? {};

    // 🧠 Micro-adaptación leve (no paraleliza ni sube CPU)
    const shockBias = Math.min(0.15 * entropy, 0.25); // 0–0.25
    const var99 = Number(((base.var99 ?? 0) * (1 + shockBias)).toFixed(6));
    const cvar99 = Number(((base.cvar99 ?? 0) * (1 + shockBias * 1.25)).toFixed(6));
    const mddP95 = Number(((base.mddP95 ?? 0) * (1 + shockBias * 0.9)).toFixed(6));

    const result = {
      mode: "safe" as const,
      strategyId,
      scenarios: MAX_SCENARIOS,
      entropy,
      distribution: { var99, cvar99, mddP95 },
      summary: "Montecarlo v11 SAFE ejecutado (adaptación ligera sobre v4.4).",
      note: "Sin paralelismo; apto para Render $85.",
    };

    console.log("✅ [V11] Montecarlo SAFE listo.");
    return result;
  } catch (err: any) {
    console.error("❌ [V11] Error:", err?.message || err);
    return {
      mode: "safe",
      strategyId,
      scenarios: 0,
      error: String(err?.message || err),
    };
  }
}

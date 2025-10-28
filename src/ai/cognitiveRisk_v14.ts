// src/ai/cognitiveRisk_v14.ts
// 🧠 Cognitive Risk v14 — Causal & Explanatory Layer (SAFE)
// Fusiona señales del v13 y produce narrativa + causas + recomendaciones.
// 🔒 Cálculo ligero, apto para Render $85.

export interface V14Input {
  strategy?: any;
  quantumRisk?: any; // salida del v13
}

export async function generateCognitiveRiskV14(strategy: any, quantumRisk: any) {
  try {
    console.log("🧠 [V14] Cognitive Risk SAFE start…");

    // Extraemos el riskScore del v13 si existe
    const baseScore: number =
      Number(quantumRisk?.risk?.riskScore ?? quantumRisk?.riskScore ?? 62);

    // Ajuste cognitivo leve (no-cost)
    const adjusted = Math.min(Math.max(baseScore * 1.02, 0), 100);
    const level =
      adjusted >= 80 ? "ALTO" : adjusted >= 60 ? "MEDIO" : "BAJO";

    // Causas hipotéticas legibles (sin cargar CPU)
    const causes = [
      "Divergencia reciente en correlación BTC–Oro",
      "Volatilidad creciente en ventana corta",
      "Sensibilidad a gaps en apertura (riesgo de ejecución)",
    ];

    const recommendations = [
      "Reducir exposición 10–20% hasta normalizar correlaciones.",
      "Aplicar filtro de volatilidad (ATR dinámico).",
      "Validar slippage en horarios de apertura/cierre.",
    ];

    const narrative =
      level === "ALTO"
        ? "El sistema detecta causas estructurales de riesgo elevadas; sugiere reducción inmediata de exposición."
        : level === "MEDIO"
        ? "Riesgo bajo control con focos puntuales; conviene reforzar filtros adaptativos."
        : "Entorno favorable; mantener exposición con vigilancia mínima.";

    const result = {
      strategyId: String(strategy?.id ?? "unknown"),
      risk: {
        riskScore: Number(adjusted.toFixed(2)),
        level,
      },
      causes,
      recommendations,
      narrative,
      note: "v14 SAFE: análisis causal ligero sobre v13.",
    };

    console.log(`✅ [V14] Listo. Nivel=${level} Score=${result.risk.riskScore}`);
    return result;
  } catch (err: any) {
    console.error("❌ [V14] Error:", err?.message || err);
    return { error: String(err?.message || err) };
  }
}

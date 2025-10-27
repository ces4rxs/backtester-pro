// src/ai/adaptiveTutor.ts — 🧠 Omega Learn v6.2 (Ultra-Compat Dataset Awareness)
// Compatible con objetos o arrays, detecta claves automáticamente sin romper nada

import fs from "fs";
import path from "path";

export function generateUnifiedAdvice(strategyId: string) {
  const datasetPath = path.join(process.cwd(), "src", "ai", "datasets", "dataset.json");

  // 📊 Cargar dataset real
  let dataset: any = null;
  try {
    if (fs.existsSync(datasetPath)) {
      const raw = fs.readFileSync(datasetPath, "utf8");
      dataset = JSON.parse(raw);
    }
  } catch (err) {
    console.error("⚠️ Error al leer dataset:", err.message);
  }

  if (!dataset) {
    return {
      summary: "Tutor Adaptativo Omega Learn v6.2 — sin dataset detectado",
      stats: { meanSharpe: 0, meanMDD: 0, meanCAGR: 0 },
      recommendations: [
        "No se detectaron métricas históricas. Ejecuta un backtest para generar dataset.json.",
      ],
    };
  }

  // 🧩 Asegurar compatibilidad con arrays
  const entry = Array.isArray(dataset) ? dataset[dataset.length - 1] : dataset;

  // 🧮 Extraer métricas con detección automática
  const sharpe =
    entry.Sharpe ?? entry.sharpe ?? entry.sharpeRatio ?? 0;
  const mdd =
    entry.MaxDD ?? entry.maxDD ?? entry.drawdown ?? entry.MaxDrawdown ?? 0;
  const cagr =
    entry.CAGR ?? entry.cagr ?? entry.growth ?? entry.ReturnCAGR ?? 0;
  const equity =
    entry.EquityFinal ?? entry.equityFinal ?? entry.Equity ?? 0;

  // 📈 Evaluación heurística del rendimiento
  const riskScore = Math.abs(mdd);
  const performanceScore = sharpe * 1.2 + cagr * 100;
  const robustness = (1 / (1 + riskScore)) * performanceScore;

  // 🧠 Diagnóstico adaptativo
  let summary = "Tutor Adaptativo Unificado Omega Learn v6.2 (Dataset Awareness+)";
  const recommendations: string[] = [];

  if (sharpe > 1.5) {
    recommendations.push("Excelente Sharpe ratio. Mantén estabilidad y mide consistencia temporal.");
  } else if (sharpe > 0.8) {
    recommendations.push("Sharpe aceptable, intenta optimizar la gestión del riesgo para mejorar estabilidad.");
  } else {
    recommendations.push("Sharpe bajo. Ajusta filtros de entrada y revisa la volatilidad de las señales.");
  }

  if (riskScore > 0.1) {
    recommendations.push("Drawdown alto detectado. Implementa control de pérdidas o trailing stops dinámicos.");
  } else {
    recommendations.push("Control de pérdidas eficiente. Mantén tu política de riesgo actual.");
  }

  if (cagr > 0.05) {
    recommendations.push("Crecimiento compuesto saludable. Considera validar en múltiples activos.");
  } else {
    recommendations.push("Crecimiento bajo. Prueba ajustar horizontes o aumentar exposición controlada.");
  }

  // 📊 Salida final
  const result = {
    summary,
    stats: {
      meanSharpe: sharpe,
      meanMDD: mdd,
      meanCAGR: cagr,
      meanEquity: equity,
      robustnessScore: robustness.toFixed(3),
    },
    recommendations,
  };

  console.log("🧠 [Tutor v6.2] Diagnóstico generado desde dataset.json");
  return result;
}

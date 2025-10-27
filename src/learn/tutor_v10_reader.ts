// src/learn/tutor_v10_reader.ts
// 🧠 OMEGA Tutor v10 (Symbiont Advisor - Report Explainer)

import fs from "fs";
import path from "path";

/**
 * Explica el reporte del Optimizer v5 y lo imprime por consola (modo tutor)
 */
export function explainOptimizerReportConsole() {
  const reportPath = path.join(process.cwd(), "reports", "opt_v5_test.json");
  if (!fs.existsSync(reportPath)) {
    console.error("⚠️ No se encontró el reporte del Optimizer v5.");
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

  console.log("🧩 Leyendo reporte OMEGA v5...");
  const { goal, base, variants, frontier } = report;

  // 1️⃣ Contexto general
  console.log(`\n🧠 OMEGA Symbiont Tutor v10`);
  console.log(`🎯 Objetivo de optimización: ${goal.metric.toUpperCase()} (${goal.direction})`);
  console.log(`📈 Estrategia base: ${base.name}`);
  console.log(`⚙️ Variantes analizadas: ${variants}`);
  console.log(`📅 Fecha de generación: ${report.generatedAt}`);

  // 2️⃣ Resumen de parámetros más destacados
  const top = frontier[0];
  console.log(`\n🏆 Variante líder: ${top.name}`);
  console.log(`🔹 Fast: ${top.params.fast.toFixed(2)}, Slow: ${top.params.slow.toFixed(2)}`);
  console.log(`📊 Sharpe Predicho: ${top.judge.predictedSharpe}`);
  console.log(`📉 MDD Predicho: ${top.judge.predictedMDD}`);
  console.log(`🤖 Confianza del modelo: ${(top.judge.meta.confidence * 100).toFixed(1)}%`);

  // 3️⃣ Interpretación automática
  const sharpe = top.judge.predictedSharpe;
  const mdd = Math.abs(top.judge.predictedMDD);
  const conf = top.judge.meta.confidence;

  let riskComment = "";
  if (mdd < 0.01) riskComment = "riesgo extremadamente bajo (ideal para capital estable)";
  else if (mdd < 0.03) riskComment = "riesgo moderado con buena tolerancia";
  else riskComment = "riesgo elevado, requiere control de posición";

  let performanceComment = "";
  if (sharpe > 2) performanceComment = "rendimiento sobresaliente y estable";
  else if (sharpe > 1) performanceComment = "rendimiento sólido y consistente";
  else performanceComment = "rendimiento aún mejorable";

  console.log(`\n🧩 Evaluación cognitiva del Tutor v10:`);
  console.log(`💬 Esta variante presenta ${performanceComment}, con ${riskComment}.`);
  console.log(`📚 Nivel de confianza del Symbiont: ${(conf * 100).toFixed(2)}%.`);
  console.log(`🧩 Conclusión: OMEGA considera esta mutación ${sharpe >= 1 ? "óptima" : "experimental"}.`);
}

/**
 * ✅ Exporta también el resultado como objeto para el Symbiont Archiver
 */
export async function explainOptimizerReport(): Promise<any> {
  const reportPath = path.join(process.cwd(), "reports", "opt_v5_test.json");
  if (!fs.existsSync(reportPath)) {
    console.error("⚠️ No se encontró el reporte del Optimizer v5.");
    return null;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const { goal, base, variants, frontier } = report;
  const top = frontier[0];
  const sharpe = top.judge.predictedSharpe;
  const mdd = Math.abs(top.judge.predictedMDD);
  const conf = top.judge.meta.confidence;

  let riskComment = "";
  if (mdd < 0.01) riskComment = "riesgo extremadamente bajo (ideal para capital estable)";
  else if (mdd < 0.03) riskComment = "riesgo moderado con buena tolerancia";
  else riskComment = "riesgo elevado, requiere control de posición";

  let performanceComment = "";
  if (sharpe > 2) performanceComment = "rendimiento sobresaliente y estable";
  else if (sharpe > 1) performanceComment = "rendimiento sólido y consistente";
  else performanceComment = "rendimiento aún mejorable";

  return {
    version: "OMEGA Symbiont Tutor v10",
    objective: `${goal.metric.toUpperCase()} (${goal.direction})`,
    baseStrategy: base.name,
    variants,
    generatedAt: report.generatedAt,
    leader: {
      name: top.name,
      params: top.params,
      predictedSharpe: sharpe,
      predictedMDD: top.judge.predictedMDD,
      confidence: (conf * 100).toFixed(2) + "%",
    },
    cognitiveSummary: {
      performance: performanceComment,
      risk: riskComment,
      confidence: (conf * 100).toFixed(2) + "%",
      conclusion: sharpe >= 1 ? "OMEGA considera esta mutación óptima" : "Mutación experimental",
    },
  };
}

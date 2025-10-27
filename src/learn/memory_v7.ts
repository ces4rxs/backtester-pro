// src/learn/memory_v7.ts — OMEGA Learn v7 (Memory Feedback Loop)
// 🔒 Seguro y compatible con v6 — no modifica archivos previos

import fs from "fs";
import path from "path";

const REPORT_V6 = path.join(process.cwd(), "reports", "memory_summary_v6.json");
const OUTPUT_V7 = path.join(process.cwd(), "reports", "memory_feedback_v7.json");

type MemoryV6 = {
  version: string;
  samples: any[];
  stats: {
    count: number;
    sharpeAvg?: number | null;
    mddAvg?: number | null;
    ratingAvg?: number | null;
    robustnessAvg?: number | null;
    overfitRiskDist: Record<string, number>;
  };
};

// Cargar la memoria consolidada (v6)
export function loadMemoryV6(): MemoryV6 {
  if (!fs.existsSync(REPORT_V6)) {
    throw new Error("No se encontró memory_summary_v6.json");
  }
  return JSON.parse(fs.readFileSync(REPORT_V6, "utf8"));
}

// Calcular correlaciones simples y patrones de comportamiento
export function analyzeFeedbackV7(mem: MemoryV6) {
  const { samples } = mem;
  if (!samples || samples.length === 0) {
    throw new Error("No hay muestras disponibles para analizar");
  }

  // Extraer valores numéricos válidos
  const sharpeVals: number[] = [];
  const mddVals: number[] = [];
  const robustVals: number[] = [];

  for (const s of samples) {
    if (typeof s.sharpe === "number") sharpeVals.push(s.sharpe);
    else if (s.sharpe?.mean) sharpeVals.push(s.sharpe.mean);

    if (typeof s.mdd === "number") mddVals.push(s.mdd);
    else if (s.mdd?.mean) mddVals.push(s.mdd.mean);

    if (typeof s.robustnessProb === "number") robustVals.push(s.robustnessProb);
  }

  const mean = (arr: number[]) => (arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0);
  const std = (arr: number[], m = mean(arr)) =>
    Math.sqrt(arr.reduce((a,b)=>a+(b-m)**2,0)/arr.length || 1);

  // Cálculos estadísticos básicos
  const sharpeMean = mean(sharpeVals);
  const sharpeStd = std(sharpeVals);
  const mddMean = mean(mddVals);
  const mddStd = std(mddVals);
  const robustMean = mean(robustVals);
  const robustStd = std(robustVals);

  // Correlación simplificada (Pearson manual)
  function correlation(a: number[], b: number[]) {
    if (a.length !== b.length || a.length < 2) return null;
    const ma = mean(a);
    const mb = mean(b);
    const cov = a.reduce((acc,_,i)=>acc+(a[i]-ma)*(b[i]-mb),0)/(a.length-1);
    return cov / (std(a,ma)*std(b,mb) || 1);
  }

  const corrSharpeMDD = correlation(sharpeVals, mddVals);
  const corrSharpeRobust = correlation(sharpeVals, robustVals);
  const corrMDDRobust = correlation(mddVals, robustVals);

  // Generar inferencia heurística
  let inference = "Neutra";
  if (sharpeMean > 1 && robustMean > 80 && (corrSharpeRobust ?? 0) > 0.4) {
    inference = "Alta Estabilidad";
  } else if (mddMean > 0.5 && sharpeMean < 0) {
    inference = "Sesgo Negativo (riesgo alto)";
  } else if ((corrSharpeMDD ?? 0) < -0.5) {
    inference = "Tendencia Equilibrada (Sharpe y MDD inversos)";
  }

  // Generar resumen final
  const feedback = {
    version: "v7",
    baseVersion: mem.version,
    samples: mem.stats.count,
    stats: {
      sharpeMean,
      sharpeStd,
      mddMean,
      mddStd,
      robustMean,
      robustStd,
      corrSharpeMDD,
      corrSharpeRobust,
      corrMDDRobust,
    },
    inference,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_V7, JSON.stringify(feedback, null, 2));
  console.log("🧠 Memory Feedback v7 generado en:", OUTPUT_V7);
  console.log("📊 Inferencia:", inference);
  return feedback;
}

// Ejecución directa (CLI)
if (process.argv[1] && process.argv[1].endsWith("memory_v7.ts")) {
  console.log("🧠 Ejecutando Omega Learn v7 – Feedback Loop...");
  const mem = loadMemoryV6();
  analyzeFeedbackV7(mem);
}

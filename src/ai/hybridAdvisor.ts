// src/ai/hybridAdvisor.ts — 🧠 Omega Learn v7.1 + v9 + v10 (Symbiont)
// Mantiene v7.1 (Hybrid) y v9 (Synaptic) intactos. Agrega v10 (Symbiont + AutoOptimize v5)

import fs from "fs";
import path from "path";
import { loadMemory } from "../learn/memoryStore.js";
import { generateAdvice } from "../learn/learner.js";
import { loadBrainprint } from "./userBrainprint.js"; // 🆕 v10
import { runAdaptiveOptimizer } from "../core_v5/optimizer_v5.js"; // v5: Optimizador Adaptativo
import type { StrategyManifest } from "../core_v5/types.js";
import { predictForCurrent } from "./predictor_v4.js";

// ---------- Tipos y Utilidades ----------
type Rec = { Sharpe?: number; MaxDD?: number; CAGR?: number; EquityFinal?: number };

const safeNum = (x: any, def = 0) => (typeof x === "number" && isFinite(x) ? x : def);
const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const toFixedNum = (x: number, d = 3) => Number(x.toFixed(d));

function normalizeToArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
}

// Similitud heurística entre estrategias
function similarity(a: Rec, b: Rec): number {
  const w = { Sharpe: 0.45, MaxDD: 0.3, CAGR: 0.25 };
  const dSharpe = Math.abs(safeNum(a.Sharpe) - safeNum(b.Sharpe));
  const dMDD = Math.abs(safeNum(a.MaxDD) - safeNum(b.MaxDD));
  const dCAGR = Math.abs(safeNum(a.CAGR) - safeNum(b.CAGR));
  const dist = w.Sharpe * dSharpe + w.MaxDD * dMDD + w.CAGR * dCAGR;
  return 1 / (1 + dist);
}

// ---------- Lectores ----------
function loadDatasetRecords(): Rec[] {
  try {
    const datasetPath = path.join(process.cwd(), "src", "ai", "datasets", "dataset.json");
    if (!fs.existsSync(datasetPath)) return [];
    const raw = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
    const rows = normalizeToArray<any>(raw);
    return rows.map((r) => ({
      Sharpe: safeNum(r.Sharpe),
      MaxDD: safeNum(r.MaxDD),
      CAGR: safeNum(r.CAGR),
      EquityFinal: safeNum(r.EquityFinal),
    }));
  } catch (e) {
    console.warn("⚠️ [v7.1] No se pudo leer dataset.json:", (e as Error).message);
    return [];
  }
}

function loadMemoryRecords(): Rec[] {
  try {
    const mem = loadMemory();
    const recs: Rec[] = [];
    for (const s of mem.samples ?? []) {
      recs.push({
        Sharpe: safeNum((s as any).sharpe),
        MaxDD: safeNum((s as any).mdd),
        CAGR: safeNum((s as any).cagr),
        EquityFinal: safeNum((s as any).equity),
      });
    }
    return recs;
  } catch (e) {
    console.warn("⚠️ [v7.1] No se pudo leer memoryStore:", (e as Error).message);
    return [];
  }
}

// ---------- Clasificación QuantGrade ----------
function computeQuantGrade(score: number): string {
  if (score >= 9) return "A+";
  if (score >= 7.5) return "A";
  if (score >= 6) return "B";
  if (score >= 4) return "C";
  return "D";
}

// ===============================================================
// 🧩 Omega Hybrid Advisor v7.1 — Tutor Adaptativo Unificado
// ===============================================================
export function generateUnifiedAdviceHybrid(
  strategyId: string,
  mode: "hybrid" | "dataset" | "memory" = "hybrid"
) {
  const datasetRecs = loadDatasetRecords();
  const memoryRecs = loadMemoryRecords();

  const ds = {
    meanSharpe: mean(datasetRecs.map((r) => safeNum(r.Sharpe))),
    meanMDD: mean(datasetRecs.map((r) => safeNum(r.MaxDD))),
    meanCAGR: mean(datasetRecs.map((r) => safeNum(r.CAGR))),
    meanEquity: mean(datasetRecs.map((r) => safeNum(r.EquityFinal))),
    count: datasetRecs.length,
  };
  const ms = {
    meanSharpe: mean(memoryRecs.map((r) => safeNum(r.Sharpe))),
    meanMDD: mean(memoryRecs.map((r) => safeNum(r.MaxDD))),
    meanCAGR: mean(memoryRecs.map((r) => safeNum(r.CAGR))),
    meanEquity: mean(memoryRecs.map((r) => safeNum(r.EquityFinal))),
    count: memoryRecs.length,
  };

  let statsSrc = mode;
  if (statsSrc === "dataset" && ds.count === 0) statsSrc = "memory";
  if (statsSrc === "memory" && ms.count === 0) statsSrc = "dataset";

  const total = ds.count + ms.count || 1;
  const wDS = statsSrc === "hybrid" ? ds.count / total : statsSrc === "dataset" ? 1 : 0;
  const wMS = statsSrc === "hybrid" ? ms.count / total : statsSrc === "memory" ? 1 : 0;

  const meanSharpe = toFixedNum(wDS * ds.meanSharpe + wMS * ms.meanSharpe, 6);
  const meanMDD = toFixedNum(wDS * ds.meanMDD + wMS * ms.meanMDD, 6);
  const meanCAGR = toFixedNum(wDS * ds.meanCAGR + wMS * ms.meanCAGR, 6);
  const meanEquity = toFixedNum(wDS * ds.meanEquity + wMS * ms.meanEquity, 6);

  const riskScore = Math.abs(meanMDD);
  const performanceScore = meanSharpe * 1.2 + meanCAGR * 100;
  const robustnessScore = toFixedNum((1 / (1 + riskScore)) * performanceScore, 3);
  const quantGrade = computeQuantGrade(robustnessScore);

  const summary = `Tutor Adaptativo Unificado Omega Learn v7.1 (Hybrid Advisor Premium)`;
  return {
    summary,
    mode: statsSrc,
    stats: { meanSharpe, meanMDD, meanCAGR, meanEquity, robustnessScore, quantGrade },
    sources: {
      datasetCount: ds.count,
      memoryCount: ms.count,
      weights: { dataset: toFixedNum(wDS, 3), memory: toFixedNum(wMS, 3) },
    },
    recommendations: [],
  };
}

// ===============================================================
// 🧬 Omega Neural Advisor v9 – Synaptic Intelligence Core
// ===============================================================
export function generateUnifiedAdviceHybridV9(
  strategyId: string,
  mode: "neural" | "hybrid" | "dataset" | "memory" = "neural"
) {
  const datasetRecs = loadDatasetRecords();
  const memoryRecs = loadMemoryRecords();

  const ds = {
    meanSharpe: mean(datasetRecs.map((r) => safeNum(r.Sharpe))),
    meanMDD: mean(datasetRecs.map((r) => safeNum(r.MaxDD))),
    meanCAGR: mean(datasetRecs.map((r) => safeNum(r.CAGR))),
  };
  const ms = {
    meanSharpe: mean(memoryRecs.map((r) => safeNum(r.Sharpe))),
    meanMDD: mean(memoryRecs.map((r) => safeNum(r.MaxDD))),
    meanCAGR: mean(memoryRecs.map((r) => safeNum(r.CAGR))),
  };

  const fusionWeight = (datasetRecs.length + memoryRecs.length) / 100;
  const synapticSharpe = toFixedNum(
    (ds.meanSharpe * 0.6 + ms.meanSharpe * 0.4) * (1 + fusionWeight * 0.05),
    6
  );
  const synapticMDD = toFixedNum(
    (ds.meanMDD * 0.4 + ms.meanMDD * 0.6) * (1 - fusionWeight * 0.03),
    6
  );
  const synapticCAGR = toFixedNum(
    (ds.meanCAGR * 0.5 + ms.meanCAGR * 0.5) * (1 + fusionWeight * 0.07),
    6
  );

  const cognitiveStability = toFixedNum(1 / (1 + Math.abs(synapticMDD)), 3);
  const synapticConsistency = toFixedNum(
    (synapticSharpe * 1.5 + synapticCAGR * 100) * cognitiveStability,
    3
  );
  const quantGrade = computeQuantGrade(synapticConsistency / 1.2);

  const neuralInsights: string[] = [];
  if (synapticSharpe > 1)
    neuralInsights.push("Modelo muestra consistencia de retorno superior a la media histórica.");
  if (synapticCAGR > 0.05)
    neuralInsights.push("Tendencia de crecimiento estable detectada en el plano sináptico.");
  if (synapticMDD < -0.1)
    neuralInsights.push("Detectado nivel de riesgo elevado, ajustar exposición o tamaño de posición.");
  if (neuralInsights.length === 0) neuralInsights.push("Sinápsis estable. Modo cognitivo en equilibrio.");

  return {
    summary: "Omega Neural Advisor v9 – Synaptic Intelligence Core",
    mode,
    stats: { meanSharpe: synapticSharpe, meanMDD: synapticMDD, meanCAGR: synapticCAGR, cognitiveStability, synapticConsistency, quantGrade },
    recommendations: neuralInsights,
  };
}

// ===============================================================
// 🫂 Omega Symbiont Advisor v10 — Personal Neural Twin + AutoOptimize v5
// ===============================================================
export async function generateUnifiedAdviceHybridV10(strategyId: string) {
  const syn = generateUnifiedAdviceHybridV9(strategyId, "neural");
  const bp = loadBrainprint(strategyId);

  if (!bp) {
    return {
      ...syn,
      summary: "Omega Symbiont Advisor v10 — Personal Neural Twin",
      note: "No se detectó User Brainprint; se usó núcleo Synaptic v9.",
    };
  }

  const rpWeight = bp.riskProfile === "BAJO" ? 0.9 : bp.riskProfile === "ALTO" ? 1.1 : 1.0;

  const stats = syn.stats as any;
  const meanSharpe = safeNum(stats.meanSharpe);
  const meanMDD = safeNum(stats.meanMDD);
  const meanCAGR = safeNum(stats.meanCAGR);

  const uSharpe = safeNum(bp.stats?.sharpe, meanSharpe);
  const uMDD = safeNum(bp.stats?.mdd, meanMDD);
  const uCAGR = safeNum(bp.stats?.cagr, meanCAGR);

  const symSharpe = toFixedNum((meanSharpe * 0.7 + uSharpe * 0.3) * rpWeight, 6);
  const symMDD = toFixedNum((meanMDD * 0.7 + uMDD * 0.3) * (2 - rpWeight), 6);
  const symCAGR = toFixedNum((meanCAGR * 0.7 + uCAGR * 0.3) * rpWeight, 6);

  const cognitiveStability = toFixedNum(1 / (1 + Math.abs(symMDD)), 3);
  const symbiontScore = toFixedNum((symSharpe * 1.5 + symCAGR * 100) * cognitiveStability, 3);
  const quantGrade = computeQuantGrade(symbiontScore / 1.2);

  const insights: string[] = [];
  if (bp.habits?.length) insights.push(`Se detectaron hábitos del operador: ${bp.habits.join(", ")}`);
  if (bp.labels?.length) insights.push(`Etiquetas cognitivas activas: ${bp.labels.join(", ")}`);
  if (bp.riskProfile) insights.push(`Perfil de riesgo: ${bp.riskProfile}`);
  if (symSharpe < meanSharpe) insights.push("Afinar reglas de salida acorde a tu sesgo de ejecución.");
  if (Math.abs(symMDD) > Math.abs(meanMDD))
    insights.push("Riesgo personal elevado: considera límites operativos y stops escalonados.");

  const recs = [
    ...(syn.recommendations ?? []),
    "Ajusta tamaño de posición dinámico según perfil de riesgo personal.",
    "Revisa consistencia en horarios/activos donde tu brainprint rinde mejor.",
  ];

  // 🔥 AutoOptimize v5
  const flagOn = process.env.OMEGA_V5_ENABLED === "true";
  const needsImprove = ["B", "C", "D"].includes(quantGrade);
  if (flagOn && needsImprove) {
    try {
      console.log(`🧠 [SYM-AUTO v5] Activando optimizador adaptativo para ${strategyId} (grade=${quantGrade})`);
      const manifest: StrategyManifest = { name: strategyId, params: { shortPeriod: 10, longPeriod: 50 } };
      const goal = { kind: "max_predictedSharpe" } as const;

      // ✅ FIX UNIVERSAL: compatibilidad total de predictor
      const prophetPredict = async (variant: any) => {
        let pred: any;
        try {
          const fn: any = predictForCurrent;
          pred = fn.length > 0
            ? await Promise.resolve(fn(variant))
            : await Promise.resolve(fn());
        } catch (err) {
          console.warn("⚠️ Predictor v4 fallback activado:", err);
          pred = {};
        }

        return {
          predictedSharpe: pred?.predictedSharpe ?? pred?.sharpe ?? 0,
          predictedMDD: pred?.predictedMDD ?? pred?.mdd ?? 0,
          antiOverfit: pred?.antiOverfit ?? 0,
        };
      };

      const report = await runAdaptiveOptimizer(manifest, goal, { prophetPredict, population: 80 });

      const top = (report.frontier || []).slice(0, 3).map((f: any) => ({
        id: f.id,
        name: f.name,
        params: f.params,
        scores: f.judge,
      }));

      insights.push("🔎 Se activó el núcleo Optimizador v5 por calificación subóptima.");
      recs.push(`Se hallaron ${top.length} variantes con mejor Sharpe proyectado.`);
      recs.push("El Symbiont recomienda revisar el reporte de optimización reciente en /reports.");

      return {
        summary: "Omega Symbiont Advisor v10 — Personal Neural Twin + AutoOptimize v5",
        mode: "symbiont",
        stats: { meanSharpe: symSharpe, meanMDD: symMDD, meanCAGR: symCAGR, cognitiveStability, symbiontScore, quantGrade },
        brainprint: bp,
        optimizer: { enabled: true, top, goal, generatedAt: report.generatedAt },
        insights,
        recommendations: recs,
      };
    } catch (e: any) {
      console.error("❌ [SYM-AUTO v5] Error:", e.message);
      insights.push(`No se pudo ejecutar el optimizador v5: ${e.message}`);
    }
  }

  return {
    summary: "Omega Symbiont Advisor v10 — Personal Neural Twin",
    mode: "symbiont",
    stats: { meanSharpe: symSharpe, meanMDD: symMDD, meanCAGR: symCAGR, cognitiveStability, symbiontScore, quantGrade },
    brainprint: { hasBrainprint: true, riskProfile: bp.riskProfile ?? "N/A", habits: bp.habits ?? [], labels: bp.labels ?? [], timestamp: bp.timestamp },
    insights,
    recommendations: recs,
  };
}

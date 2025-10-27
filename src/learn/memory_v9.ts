// src/learn/memory_v9.ts
// 🧠 OMEGA Cognitive Learner v9 (consolida v6 + feedback v7 + señales v8.x)
// - No rompe nada: solo LEE memory_summary_v6.json y memory_feedback_v7.json
// - Escribe: reports/memory_adaptive_v9.json y reports/memory_dataset_v9.json

import fs from "fs";
import path from "path";

type NumOrStats = number | { mean?: number; sd?: number; p05?: number; p50?: number; p95?: number };

type V6Sample = {
  strategyId: string;
  sharpe?: NumOrStats;
  mdd?: NumOrStats;
  cvar?: NumOrStats;
  quantumRating?: number;
  overfitRisk?: "BAJO" | "MEDIO" | "ALTO";
  robustnessProb?: number; // 0..100
  labels?: string[];
  timestamp: string;
};

type V6Summary = {
  version: string; // "v6"
  samples: V6Sample[];
  stats: {
    count: number;
    sharpeAvg?: number | null;
    mddAvg?: number | null;
    cvarAvg?: number | null;
    ratingAvg?: number | null;
    robustnessAvg?: number | null;
    overfitRiskDist: Record<string, number>;
  };
};

type V7Feedback = {
  version: string; // "v7"
  baseVersion?: string;
  count: number;
  sharpeMean?: number | null;
  mddMean?: number | null;
  heuristic?: string;
  generatedAt?: string;
};

type AdaptiveReportV9 = {
  version: "v9";
  basedOn: string[]; // ["v6","v7","v8.1"]
  sharpeAdaptive: number;   // promedio robusto
  mddAdaptive: number;      // promedio robusto (signo negativo como drawdown)
  robustnessAdaptive: number; // 0..100
  cognitiveInference: string; // texto heurístico
  generated: string; // ISO
  notes?: string[];
};

type DatasetV9 = {
  version: "v9";
  ts: string;
  metrics: {
    sharpeAdaptive: number;
    mddAdaptive: number;
    robustnessAdaptive: number;
  };
  dist: {
    sharpe: { mean: number; sd: number };
    mdd: { mean: number; sd: number };
  };
  insight: string;
};

// ---------- Helpers ----------
function r(pathParts: string[]) {
  return path.join(process.cwd(), ...pathParts);
}

function loadJSON<T>(p: string): T | null {
  try {
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function val(n?: NumOrStats): number | null {
  if (typeof n === "number") return n;
  if (n && typeof n === "object" && typeof n.mean === "number") return n.mean!;
  return null;
}

function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function sd(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const v = mean(arr.map(x => (x - m) ** 2));
  return Math.sqrt(v);
}

// ---------- Core ----------
export default function runMemoryV9(): AdaptiveReportV9 {
  const reportsDir = r(["reports"]);
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  // Entradas previas (no se modifican)
  const v6Path = r(["reports", "memory_summary_v6.json"]);
  const v7Path = r(["reports", "memory_feedback_v7.json"]);

  const v6 = loadJSON<V6Summary>(v6Path);
  const v7 = loadJSON<V7Feedback>(v7Path);

  // Extraer arrays numéricos “seguros” desde v6
  const sharpeArr: number[] = [];
  const mddArrAbs: number[] = []; // trabajamos en magnitud (positiva) para promediar
  const robustnessArr: number[] = [];

  if (v6?.samples?.length) {
    for (const s of v6.samples) {
      const sh = val(s.sharpe);
      if (typeof sh === "number" && Number.isFinite(sh)) sharpeArr.push(sh);

      const dd = val(s.mdd);
      if (typeof dd === "number" && Number.isFinite(dd)) mddArrAbs.push(Math.abs(dd));

      if (typeof s.robustnessProb === "number" && Number.isFinite(s.robustnessProb)) {
        robustnessArr.push(s.robustnessProb);
      }
    }
  }

  // Mezclar con feedback v7 si aporta medias
  if (v7) {
    if (typeof v7.sharpeMean === "number" && Number.isFinite(v7.sharpeMean)) {
      sharpeArr.push(v7.sharpeMean);
    }
    if (typeof v7.mddMean === "number" && Number.isFinite(v7.mddMean)) {
      mddArrAbs.push(Math.abs(v7.mddMean));
    }
  }

  // Métricas adaptativas
  const sharpeAdaptive = Number(mean(sharpeArr).toFixed(4));
  // mddAdaptive se devuelve NEGATIVO (drawdown) a partir del promedio de magnitudes
  const mddAdaptive = Number((-mean(mddArrAbs)).toFixed(4));
  const robustnessAdaptive = Number(mean(robustnessArr).toFixed(2));

  // Heurística simple y legible
  let inference = "Equilibrada";
  const notes: string[] = [];
  if (sharpeAdaptive < 0) {
    inference = "Desviación negativa detectada. Ajuste recomendado.";
    notes.push("Sharpe adaptativo < 0");
  } else if (robustnessAdaptive && robustnessAdaptive < 60) {
    inference = "Robustez baja, validar estabilidad.";
    notes.push("Robustez < 60%");
  }

  // Reporte principal (para consumo interno / logs)
  const now = new Date().toISOString();
  const report: AdaptiveReportV9 = {
    version: "v9",
    basedOn: ["v6", "v7", "v8.1"],
    sharpeAdaptive,
    mddAdaptive,
    robustnessAdaptive,
    cognitiveInference: inference,
    generated: now,
    notes: notes.length ? notes : undefined,
  };

  const outMain = r(["reports", "memory_adaptive_v9.json"]);
  fs.writeFileSync(outMain, JSON.stringify(report, null, 2), "utf8");

  // Dataset compacto para dashboard (estadísticos básicos)
  const dataset: DatasetV9 = {
    version: "v9",
    ts: now,
    metrics: {
      sharpeAdaptive,
      mddAdaptive,
      robustnessAdaptive,
    },
    dist: {
      sharpe: { mean: Number(mean(sharpeArr).toFixed(4)), sd: Number(sd(sharpeArr).toFixed(4)) },
      mdd: { mean: Number(mean(mddArrAbs).toFixed(4)), sd: Number(sd(mddArrAbs).toFixed(4)) },
    },
    insight: inference,
  };

  const outDataset = r(["reports", "memory_dataset_v9.json"]);
  fs.writeFileSync(outDataset, JSON.stringify(dataset, null, 2), "utf8");

  // Salida de consola elegante
  console.log("🧠 OMEGA Cognitive Learner v9 listo.");
  console.log(`📄 Guardado: ${outMain}`);
  console.log(`📊 Dataset:  ${outDataset}`);
  console.log(`   ▶ Sharpe adaptativo: ${sharpeAdaptive}`);
  console.log(`   ▶ MDD adaptativo:    ${mddAdaptive}`);
  console.log(`   ▶ Robustez:          ${robustnessAdaptive}%`);
  console.log(`   ▶ Inferencia:        ${inference}`);

  return report;
}

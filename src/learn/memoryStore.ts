// src/learn/memoryStore.ts — Memoria persistente de Omega Learn (nivel 2)
import fs from "fs";
import path from "path";

export type LearnSample = {
  strategyId: string;
  sharpe?: number;        // métrica opcional
  mdd?: number;           // drawdown máximo (negativo)
  cvar?: number;          // CVaR estimado (negativo)
  quantumRating?: number; // 0..10
  overfitRisk?: "BAJO" | "MEDIO" | "ALTO";
  robustnessProb?: number; // 0..100
  labels?: string[];      // etiquetas opcionales
  timestamp: string;      // ISO
};

export type LearnMemory = {
  version: string;
  samples: LearnSample[];
  stats: {
    count: number;
    sharpeAvg?: number;
    mddAvg?: number;
    cvarAvg?: number;
    ratingAvg?: number;
    robustnessAvg?: number;
    overfitRiskDist: Record<string, number>;
  };
};

const MEM_DIR = path.join(process.cwd(), "learn");
const MEM_FILE = path.join(MEM_DIR, "memory.json");

// Asegurar carpeta y archivo
export function ensureMemory() {
  if (!fs.existsSync(MEM_DIR)) fs.mkdirSync(MEM_DIR, { recursive: true });
  if (!fs.existsSync(MEM_FILE)) {
    const init: LearnMemory = {
      version: "v1",
      samples: [],
      stats: { count: 0, overfitRiskDist: {} },
    };
    fs.writeFileSync(MEM_FILE, JSON.stringify(init, null, 2));
  }
}

export function loadMemory(): LearnMemory {
  ensureMemory();
  const raw = fs.readFileSync(MEM_FILE, "utf8");
  return JSON.parse(raw) as LearnMemory;
}

export function saveMemory(mem: LearnMemory) {
  ensureMemory();
  fs.writeFileSync(MEM_FILE, JSON.stringify(mem, null, 2));
}

export function appendSample(sample: LearnSample): LearnMemory {
  const mem = loadMemory();
  mem.samples.push(sample);
  mem.stats = recomputeStats(mem.samples);
  saveMemory(mem);
  return mem;
}

export function recomputeStats(samples: LearnSample[]): LearnMemory["stats"] {
  const n = samples.length;
  if (n === 0) return { count: 0, overfitRiskDist: {} };

  const sum = (arr: number[]) => arr.reduce((a,b)=>a+b, 0);
  const filterNum = (xs: (number | undefined)[]) => xs.filter((x): x is number => typeof x === "number");

  const sharpeArr = filterNum(samples.map(s => s.sharpe));
  const mddArr    = filterNum(samples.map(s => s.mdd));
  const cvarArr   = filterNum(samples.map(s => s.cvar));
  const rateArr   = filterNum(samples.map(s => s.quantumRating));
  const robArr    = filterNum(samples.map(s => s.robustnessProb));

  const overfitRiskDist: Record<string, number> = {};
  for (const s of samples) {
    if (!s.overfitRisk) continue;
    overfitRiskDist[s.overfitRisk] = (overfitRiskDist[s.overfitRisk] || 0) + 1;
  }

  return {
    count: n,
    sharpeAvg: sharpeArr.length ? sum(sharpeArr)/sharpeArr.length : undefined,
    mddAvg:    mddArr.length    ? sum(mddArr)/mddArr.length       : undefined,
    cvarAvg:   cvarArr.length   ? sum(cvarArr)/cvarArr.length     : undefined,
    ratingAvg: rateArr.length   ? sum(rateArr)/rateArr.length     : undefined,
    robustnessAvg: robArr.length? sum(robArr)/robArr.length       : undefined,
    overfitRiskDist
  };
}

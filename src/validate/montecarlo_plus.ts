// src/validate/montecarlo_plus.ts
// 🧠 Mandamiento #5 Quantum+ — métricas extendidas, R-Score y histogramas en consola
// No rompe nada: archivo nuevo, ESM puro, sin deps externas.

import type { Bar } from "../core/types.js";
import { runBacktest } from "../core/engine.js";
import { createRNG } from "../core/rng.js";
import fs from "fs";

type MCOpts = {
  runs?: number;
  feeVarPct?: number;
  slipVarPct?: number;
  priceJitterPct?: number;
  seed?: number | string;
  saveReport?: boolean;         // guarda JSON extendido
  saveCSV?: boolean;            // guarda CSV con series crudas
  showHists?: boolean;          // imprime histogramas en consola
};

type MCPlusReport = {
  runs: number;
  seed: number | string;
  stats: {
    cagr: StatBlock;
    mdd: StatBlock;
    sharpe: StatBlock;
    returnTotal: StatBlock;
  };
  rscore: number;               // 0..1 Robustness Score (Quantum+)
  probs: {
    profitable: number;         // % sims con retorno > 0
    sharpe_ge_2: number;        // % sims con Sharpe >= 2
  };
};

type StatBlock = { mean: number; sd: number; p05: number; p50: number; p95: number };

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

function stats(xs: number[]): StatBlock {
  const s = [...xs].sort((a, b) => a - b);
  const mean = s.reduce((a, b) => a + b, 0) / (s.length || 1);
  const var_ = s.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, s.length - 1);
  const sd = Math.sqrt(var_);
  const pick = (q: number) => s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))] ?? 0;
  return { mean, sd, p05: pick(0.05), p50: pick(0.5), p95: pick(0.95) };
}

function perturbBars(bars: Bar[], jitterPct: number, rng: () => number) {
  if (!jitterPct) return bars;
  return bars.map(b => {
    const j = (rng() * 2 - 1) * jitterPct; // -j..+j
    const k = 1 + j;
    return { ...b, o: b.o * k, h: b.h * k, l: b.l * k, c: b.c * k };
  });
}

/** Histograma ASCII simple (sin deps) */
function consoleHist(series: number[], title: string, bins = 20, width = 40) {
  if (!series.length) return;
  const min = Math.min(...series), max = Math.max(...series);
  const range = max - min || 1;
  const counts = new Array(bins).fill(0);
  for (const v of series) {
    let idx = Math.floor(((v - min) / range) * bins);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  }
  const maxCount = Math.max(...counts) || 1;
  console.log(`\n— Histograma: ${title} — [min=${min.toFixed(4)} | max=${max.toFixed(4)}]`);
  counts.forEach((c, i) => {
    const bar = "█".repeat(Math.max(1, Math.round((c / maxCount) * width)));
    const lo = (min + (range * i) / bins).toFixed(4);
    const hi = (min + (range * (i + 1)) / bins).toFixed(4);
    console.log(`${lo} – ${hi} | ${bar} ${c}`);
  });
}

/** R-Score (0..1): combina calidad, prob. de éxito y riesgo de cola */
function computeRScore(sharpeArr: number[], mddArr: number[], retArr: number[]): { rscore: number, probs: { profitable: number, sharpe_ge_2: number } } {
  const n = sharpeArr.length || 1;
  const profitable = clamp01(retArr.filter(x => x > 0).length / n);
  const sharpe_ge_2 = clamp01(sharpeArr.filter(x => x >= 2).length / n);

  // Penaliza colas: usa p95 de MDD como riesgo extremo
  const mddStats = stats(mddArr);
  const tailRisk = clamp01(mddStats.p95);           // 0 (sin riesgo) .. 1 (alto)
  const riskComponent = 1 - tailRisk;               // 1 mejor

  // Ponderación: 40% Sharpe estable, 30% prob. de ganancia, 30% (1 - tailRisk)
  const rscore = clamp01(0.4 * sharpe_ge_2 + 0.3 * profitable + 0.3 * riskComponent);
  return { rscore, probs: { profitable, sharpe_ge_2 } };
}

/**
 * Monte Carlo Quantum+ — corre simulaciones y entrega estadísticas + R-Score.
 * No sustituye al módulo básico: es un “add-on” que puedes ejecutar aparte.
 */
export function monteCarloPlus(
  bars: Bar[],
  strategy: any,
  baseOpts = { initialCash: 10000, feeBps: 10, slippageBps: 5 },
  opts: MCOpts = {}
): MCPlusReport {
  const runs = opts.runs ?? 100;
  const feeVar = clamp01(opts.feeVarPct ?? 0.25);
  const slipVar = clamp01(opts.slipVarPct ?? 0.25);
  const jitter = Math.max(0, opts.priceJitterPct ?? 0.005);

  const { rng, seedUsed } = createRNG(opts.seed ?? Date.now());

  const cagrArr: number[] = [];
  const mddArr: number[] = [];
  const sharpeArr: number[] = [];
  const retArr: number[] = [];

  console.log("🚀 Monte Carlo Quantum+ iniciado…");

  for (let i = 0; i < runs; i++) {
    const feeBps = baseOpts.feeBps * (1 + (rng() * 2 - 1) * feeVar);
    const slippageBps = baseOpts.slippageBps * (1 + (rng() * 2 - 1) * slipVar);
    const simBars = perturbBars(bars, jitter, rng);

    const res = runBacktest(simBars, strategy, { ...baseOpts, feeBps, slippageBps });
    cagrArr.push(res.cagr);
    mddArr.push(res.mdd);
    sharpeArr.push(res.sharpe);
    retArr.push(res.returnTotal);
  }

  const report: MCPlusReport = {
    runs,
    seed: seedUsed,
    stats: {
      cagr: stats(cagrArr),
      mdd: stats(mddArr),
      sharpe: stats(sharpeArr),
      returnTotal: stats(retArr),
    },
    ...computeRScore(sharpeArr, mddArr, retArr),
  };

  // Salidas opcionales
  if (opts.showHists) {
    consoleHist(sharpeArr, "Sharpe");
    consoleHist(mddArr, "MDD");
    consoleHist(retArr, "Return Total");
  }

  if (opts.saveReport) {
    const path = `./reports/montecarlo_plus_${Date.now()}.json`;
    fs.writeFileSync(path, JSON.stringify(report, null, 2));
    console.log(`📦 Reporte Quantum+ guardado en: ${path}`);
  }
  if (opts.saveCSV) {
    const csv = ["cagr,mdd,sharpe,returnTotal"]
      .concat(cagrArr.map((_, i) => `${cagrArr[i]},${mddArr[i]},${sharpeArr[i]},${retArr[i]}`))
      .join("\n");
    const csvPath = `./reports/montecarlo_plus_${Date.now()}.csv`;
    fs.writeFileSync(csvPath, csv);
    console.log(`📄 CSV de simulaciones guardado en: ${csvPath}`);
  }

  console.log(`✅ Monte Carlo Quantum+ completado | R-Score=${report.rscore.toFixed(3)} | P(Sharpe≥2)=${(report.probs.sharpe_ge_2*100).toFixed(1)}% | P(Ganar)=${(report.probs.profitable*100).toFixed(1)}%`);
  return report;
}

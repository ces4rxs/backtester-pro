// src/runMontePlus.ts
console.log("🚀 Iniciando Mandamiento #5 Quantum+ …");

import { monteCarloPlus } from "./validate/montecarlo_plus.js";
import btcData from "./data/sample_btc_usd_1d.json" assert { type: "json" };
import { myStrategy } from "./strategies/example.js";

const bars = btcData;

const baseOpts = { initialCash: 10000, feeBps: 10, slippageBps: 5 };
const mcOpts = {
  runs: 100,
  feeVarPct: 0.25,
  slipVarPct: 0.25,
  priceJitterPct: 0.005,
  seed: 42,
  saveReport: true,
  saveCSV: false,
  showHists: true,
};

const rep = monteCarloPlus(bars, myStrategy, baseOpts, mcOpts);

console.log("\n=== RESUMEN QUANTUM+ ===");
console.table({
  Runs: rep.runs,
  Seed: rep.seed,
  "CAGR μ": rep.stats.cagr.mean.toFixed(4),
  "Sharpe μ": rep.stats.sharpe.mean.toFixed(2),
  "MDD p95": rep.stats.mdd.p95.toFixed(4),
  "P(Sharpe≥2)": (rep.probs.sharpe_ge_2 * 100).toFixed(1) + "%",
  "P(Ganar)": (rep.probs.profitable * 100).toFixed(1) + "%",
  "R-Score": rep.rscore.toFixed(3),
});

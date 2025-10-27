// src/ai/montecarlo.ts — OMEGA CORE v4.4 (Monte Carlo)
import { predictForCurrent } from "./predictor_v4.js";

type MCResult = {
  runs: number;
  meanReturn: number;
  p95Return: number;
  p05Return: number;
  expectedMDD: number;
  antiOverfit: number; // 0-100
  samples: number[];   // returns simulados (para histograma)
};

export function runMonteCarlo(simulations = 300): { ok: boolean; result: MCResult } {
  const pred = predictForCurrent();
  const muSharpe = pred.predictedSharpe;
  const muCAGR   = pred.predictedCAGR;
  const muMDD    = Math.abs(pred.predictedMDD);

  // parámetros de dispersión suaves
  const volSharpe = 0.25;
  const volCAGR = 0.2 * muCAGR + 0.01;
  const volMDD = 0.3 * muMDD + 0.01;

  const gauss = () => {
    // Box-Muller
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0*Math.PI*v);
  };

  const samples:number[] = [];
  let mddAcc = 0;
  for (let i=0;i<simulations;i++){
    const s  = muSharpe + gauss()*volSharpe;
    const cg = muCAGR   + gauss()*volCAGR;
    const md = muMDD    + Math.abs(gauss()*volMDD);

    // retorno anualizado esperado (muy simple)
    const ret = Math.max(-0.5, Math.min(0.8, cg * (1 + 0.15*s - 0.1*md)));
    samples.push(ret);
    mddAcc += md;
  }

  const mean = (a:number[]) => a.reduce((p,c)=>p+c,0)/Math.max(1,a.length);
  const sorted = samples.slice().sort((a,b)=>a-b);
  const q = (p:number) => {
    const idx = Math.floor((sorted.length-1)*p);
    return sorted[Math.max(0, Math.min(sorted.length-1, idx))];
  };

  const meanReturn = mean(samples);
  const p05Return = q(0.05);
  const p95Return = q(0.95);
  const expectedMDD = mddAcc/simulations;

  // anti-overfit: mejor cuando p05 no es demasiado negativo y spread moderado
  const spread = p95Return - p05Return;
  let antiOverfit = 100 * Math.max(0, 1 - (Math.abs(p05Return)+spread)/1.2);
  antiOverfit = Math.max(5, Math.min(98, antiOverfit));

  return {
    ok: true,
    result: {
      runs: simulations,
      meanReturn: Number((meanReturn*100).toFixed(2)),
      p95Return:  Number((p95Return*100).toFixed(2)),
      p05Return:  Number((p05Return*100).toFixed(2)),
      expectedMDD: Number((expectedMDD*100).toFixed(2)),
      antiOverfit: Number(antiOverfit.toFixed(1)),
      samples: samples.map(x=> Number((x*100).toFixed(2))),
    }
  };
}

import type { Bar } from "../core/types.js";
import { runBacktest } from "../core/engine.js";
import { randomTune, type Space } from "../ai/tuner.js";

export type FoldResult = {
  fold: number;
  trainRange: [number, number];
  testRange: [number, number];
  params: any;
  metrics: {
    cagr: number; sharpe: number; sortino: number; mdd: number; returnTotal: number;
  };
};

export type WalkForwardSummary = {
  folds: FoldResult[];
  stability: {
    sharpeMean: number; sharpeStd: number;
    cagrMean: number;   cagrStd: number;
    mddMean: number;    mddStd: number;
  };
  avgScore: number; // promedio de (cagr - 0.6*mdd) en test
};

function sliceBars(bars: Bar[], i0: number, i1: number) {
  return bars.slice(i0, i1);
}
function mean(xs: number[]) { return xs.reduce((a,b)=>a+b,0)/Math.max(1,xs.length); }
function std(xs: number[]) {
  const m = mean(xs); const v = mean(xs.map(x => (x-m)*(x-m)));
  return Math.sqrt(v);
}

/** Walk-Forward con K folds. En cada fold hace tuning en train y evalúa en test. */
export function walkForward(
  bars: Bar[],
  makeStrategy: (p:any)=>any,
  space: Space,
  opts = { k: 4, trainRatio: 0.7, iters: 60 }
): WalkForwardSummary {
  const n = bars.length;
  const folds: FoldResult[] = [];
  const k = Math.max(2, opts.k);
  const foldSize = Math.floor(n / k);

  for (let f=0; f<k; f++) {
    const testStart = f*foldSize;
    const testEnd   = f === k-1 ? n : (f+1)*foldSize;
    const testBars  = sliceBars(bars, testStart, testEnd);

    // train: ventana que termina justo antes del test
    const trainEnd  = Math.max(testStart, Math.floor(testStart * (opts.trainRatio)));
    const trainBars = sliceBars(bars, 0, Math.max(trainEnd, 1));

    // tuning en train
    const best = randomTune(
      (p:any)=> makeStrategy(p),
      trainBars,
      space,
      { iters: opts.iters, patience: Math.floor(opts.iters/3), mddPenalty: 0.6, minTrades: 3 }
    );

    // eval en test
    const strat = makeStrategy(best.params);
    const res = runBacktest(testBars, strat);

    folds.push({
      fold: f+1,
      trainRange: [0, trainBars.length],
      testRange:  [testStart, testEnd],
      params: best.params,
      metrics: {
        cagr: res.cagr, sharpe: res.sharpe, sortino: res.sortino, mdd: res.mdd, returnTotal: res.returnTotal
      }
    });
  }

  const sharpeArr = folds.map(x=>x.metrics.sharpe);
  const cagrArr   = folds.map(x=>x.metrics.cagr);
  const mddArr    = folds.map(x=>x.metrics.mdd);
  const scoreArr  = folds.map(x=>x.metrics.cagr - 0.6*x.metrics.mdd);

  return {
    folds,
    stability: {
      sharpeMean: mean(sharpeArr), sharpeStd: std(sharpeArr),
      cagrMean:   mean(cagrArr),   cagrStd:   std(cagrArr),
      mddMean:    mean(mddArr),    mddStd:    std(mddArr),
    },
    avgScore: mean(scoreArr),
  };
}

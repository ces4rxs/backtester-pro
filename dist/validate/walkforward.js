import { runBacktest } from "../core/engine.js";
import { randomTune } from "../ai/tuner.js";
function sliceBars(bars, i0, i1) {
    return bars.slice(i0, i1);
}
function mean(xs) { return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length); }
function std(xs) {
    const m = mean(xs);
    const v = mean(xs.map(x => (x - m) * (x - m)));
    return Math.sqrt(v);
}
/** Walk-Forward con K folds. En cada fold hace tuning en train y evalúa en test. */
export function walkForward(bars, makeStrategy, space, opts = { k: 4, trainRatio: 0.7, iters: 60 }) {
    const n = bars.length;
    const folds = [];
    const k = Math.max(2, opts.k);
    const foldSize = Math.floor(n / k);
    for (let f = 0; f < k; f++) {
        const testStart = f * foldSize;
        const testEnd = f === k - 1 ? n : (f + 1) * foldSize;
        const testBars = sliceBars(bars, testStart, testEnd);
        // train: ventana que termina justo antes del test
        const trainEnd = Math.max(testStart, Math.floor(testStart * (opts.trainRatio)));
        const trainBars = sliceBars(bars, 0, Math.max(trainEnd, 1));
        // tuning en train
        const best = randomTune((p) => makeStrategy(p), trainBars, space, { iters: opts.iters, patience: Math.floor(opts.iters / 3), mddPenalty: 0.6, minTrades: 3 });
        // eval en test
        const strat = makeStrategy(best.params);
        const res = runBacktest(testBars, strat);
        folds.push({
            fold: f + 1,
            trainRange: [0, trainBars.length],
            testRange: [testStart, testEnd],
            params: best.params,
            metrics: {
                cagr: res.cagr, sharpe: res.sharpe, sortino: res.sortino, mdd: res.mdd, returnTotal: res.returnTotal
            }
        });
    }
    const sharpeArr = folds.map(x => x.metrics.sharpe);
    const cagrArr = folds.map(x => x.metrics.cagr);
    const mddArr = folds.map(x => x.metrics.mdd);
    const scoreArr = folds.map(x => x.metrics.cagr - 0.6 * x.metrics.mdd);
    return {
        folds,
        stability: {
            sharpeMean: mean(sharpeArr), sharpeStd: std(sharpeArr),
            cagrMean: mean(cagrArr), cagrStd: std(cagrArr),
            mddMean: mean(mddArr), mddStd: std(mddArr),
        },
        avgScore: mean(scoreArr),
    };
}

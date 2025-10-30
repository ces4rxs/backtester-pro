export function buildReport(args) {
    const { meta, base, wf, mc } = args;
    const stabilityNote = [
        `Estabilidad (WF): Sharpe μ=${wf.stability.sharpeMean.toFixed(2)} σ=${wf.stability.sharpeStd.toFixed(2)},`,
        `CAGR μ=${(wf.stability.cagrMean * 100).toFixed(2)}% σ=${(wf.stability.cagrStd * 100).toFixed(2)}%,`,
        `MDD μ=${(wf.stability.mddMean * 100).toFixed(1)}% σ=${(wf.stability.mddStd * 100).toFixed(1)}%.`
    ].join(" ");
    const mcNote = [
        `Monte Carlo: Sharpe ~ P05=${mc.sharpe.p05.toFixed(2)} | P50=${mc.sharpe.p50.toFixed(2)} | P95=${mc.sharpe.p95.toFixed(2)};`,
        `CAGR ~ P05=${(mc.cagr.p05 * 100).toFixed(1)}% | P50=${(mc.cagr.p50 * 100).toFixed(1)}% | P95=${(mc.cagr.p95 * 100).toFixed(1)}%;`,
        `MDD ~ P05=${(mc.mdd.p05 * 100).toFixed(1)}% | P50=${(mc.mdd.p50 * 100).toFixed(1)}% | P95=${(mc.mdd.p95 * 100).toFixed(1)}%.`
    ].join(" ");
    const expl = [
        `Backtest en ${meta.asset} (${meta.timeframe}), ${meta.bars} barras.`,
        `Base: CAGR ${(base.cagr * 100).toFixed(2)}% | Sharpe ${base.sharpe.toFixed(2)} | MDD ${(base.mdd * 100).toFixed(1)}%.`,
        stabilityNote,
        mcNote,
        `Sugerencia: si la inestabilidad (σ) es alta, usar filtro de tendencia, stop ATR y limitar riesgo por trade.`,
        `Nota educativa: resultados pasados no garantizan rendimientos futuros.`
    ].join(" ");
    return { meta, base, walkForward: wf, monteCarlo: mc, explanation: expl };
}

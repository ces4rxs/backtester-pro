// src/utils/metrics.ts

/**
 * Calcula métricas globales a partir de la curva de equidad y los trades.
 * Usado por el Adaptive Engine para evaluar el rendimiento acumulado.
 */

export function calculateMetrics(
  equityCurve: { time: number; equity: number }[],
  trades: any[],
  totalBars: number,
  initialCash: number
) {
  if (!equityCurve || equityCurve.length < 2) {
    throw new Error("Curva de equidad insuficiente para calcular métricas.");
  }

  // Serie numérica de equidad
  const series = equityCurve.map(e => e.equity);
  const finalEquity = series[series.length - 1];
  const returnTotal = (finalEquity - initialCash) / initialCash;

  // CAGR (anualizado, suponiendo 252 días de trading)
  const years = totalBars / 252;
  const cagr = Math.pow(1 + returnTotal, 1 / years) - 1;

  // Retornos diarios
  const returns: number[] = [];
  for (let i = 1; i < series.length; i++) {
    const r = (series[i] - series[i - 1]) / series[i - 1];
    if (isFinite(r)) returns.push(r);
  }

  // Promedio y desviaciones
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std =
    Math.sqrt(
      returns.map(r => Math.pow(r - mean, 2)).reduce((a, b) => a + b, 0) /
        (returns.length - 1)
    ) || 0;

  // Sharpe
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;

  // Sortino
  const neg = returns.filter(r => r < 0);
  const downside =
    Math.sqrt(
      neg.map(r => r * r).reduce((a, b) => a + b, 0) / (neg.length || 1)
    ) || 0;
  const sortino = downside > 0 ? (mean / downside) * Math.sqrt(252) : 0;

  // Drawdown máximo
  let peak = -Infinity;
  let mdd = 0;
  for (const eq of series) {
    if (eq > peak) peak = eq;
    const dd = (peak - eq) / peak;
    if (dd > mdd) mdd = dd;
  }

  // Ratio de rentabilidad sobre drawdown (opcional)
  const calmar = mdd > 0 ? cagr / mdd : 0;

  return {
    equityFinal: finalEquity,
    returnTotal,
    cagr,
    sharpe,
    sortino,
    mdd,
    calmar,
    trades: trades.length,
  };
}

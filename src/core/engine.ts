// src/core/engine.ts (v3.18 - Quantum Realism Audit+ + Exporter)
console.log("--- ¡¡VERSIÓN OMEGA v3.18 (REALISM + AUDIT TRADE SLIPPAGE + STABILITY) CARGADA!! ---");

import type { Bar, Strategy, Position, EngineOptions } from "./types.js";
import { Decimal, D } from "./decimal.js";
import { DP, initLedger, applyFill, equity, type LedgerState, type Money } from "./ledger_v3.js";
import { createRNG } from "./rng.js";
import { createManifest } from "./manifest.js";
import { validateBars } from "./data.guard.js";
import { startJournal, appendTrade, finalizeJournal } from "./journal.js";
import { computeSlippageBps } from "./execution.js";
import fs from "fs";
import path from "path";

// === 🔒 Función auxiliar: reviveLedgerState ===
function reviveLedgerState(s: LedgerState): LedgerState {
  return {
    cash: s.cash instanceof Decimal ? s.cash : D(s.cash),
    pos: s.pos instanceof Decimal ? s.pos : D(s.pos),
    avgPrice: s.avgPrice instanceof Decimal ? s.avgPrice : D(s.avgPrice),
  };
}

// === 🧠 Función principal: runBacktest ===
export function runBacktest(bars: Bar[], strategy: Strategy, options: EngineOptions = {}) {
  if (!bars || bars.length < 2) throw new Error("Dataset insuficiente");

  const { rng, seedUsed } = createRNG(options.seed);
  const runId = `omega-${Date.now()}`;

  // 🧩 DataGuard opcional
  let checksum = "none";
  if (options.validateData) {
    console.log("🧩 [DataGuard] Verificando integridad de dataset...");
    const guard = validateBars(bars, { strict: true, expectSorted: true, allowEqualTimestamps: false });
    if (!guard.ok) {
      console.warn("⚠️ DataGuard encontró problemas:", guard.errors);
    } else {
      console.log("✅ [DataGuard] OK - Checksum:", guard.checksum);
      checksum = guard.checksum;
    }
  }

  // 📒 Journal opcional
  const journaling = !!options.enableJournal;
  const journal = journaling ? startJournal({ runId, dir: options.journalDir }) : null;
  let journalChecksum: string | undefined = undefined;

  // 💰 Ledger
  const originalState = initLedger(options.initialCash ?? 10000);
  let state: LedgerState = reviveLedgerState(originalState);

  const equitySeries_D: Money[] = [state.cash];
  const trades: any[] = [];
  const feeBps_D = D(options.feeBps ?? 0);
  const fallbackSlippageBps_D = D(options.slippageBps ?? 0);

  if (strategy.warmup) strategy.warmup(bars);

  const startIndex = 1;
  for (let i = startIndex; i < bars.length; i++) {
    state = reviveLedgerState(state);
    const bar = bars[i];
    if (!bar) continue;

    const barClose_D = D((bar as any).c ?? (bar as any).close);
    const pos = D(state.pos);

    const currentPosition: Position | null = pos.gt(0)
      ? { size: pos, entryPrice: state.avgPrice }
      : null;

    const signal = strategy.onBar(bar, i, currentPosition);

    // === BUY ===
    if (signal === "buy" && !currentPosition) {
      const sizeToBuy = state.cash.div(barClose_D);
      if (!sizeToBuy.isFinite() || sizeToBuy.lte(0)) continue;

      const tradeSlippageBps =
        options.slippage?.mode
          ? (computeSlippageBps({
              bars,
              index: i,
              side: "buy",
              sizeAbs: sizeToBuy.toNumber(),
              cfg: options.slippage,
            }) ?? (options.slippageBps ?? 0))
          : (options.slippageBps ?? 0);

      const fill = applyFill(state, "buy", barClose_D, sizeToBuy, feeBps_D, {
        slippageBps: D(tradeSlippageBps) ?? fallbackSlippageBps_D,
      });
      state = reviveLedgerState(fill.state);

      trades.push({
        type: "buy",
        time: bar.t,
        price: barClose_D.toDP(DP.price).toNumber(),
        size: sizeToBuy.toDP(DP.size).toNumber(),
        fee: fill.fee.toNumber(),
        slippageBps: Number(tradeSlippageBps),
      });

      if (journal)
        appendTrade(journal, {
          runId,
          time: bar.t,
          side: "buy",
          price: barClose_D.toDP(DP.price).toNumber(),
          size: sizeToBuy.toDP(DP.size).toNumber(),
          fee: fill.fee.toNumber(),
          slippageBps: Number(tradeSlippageBps),
        });
    }

    // === SELL ===
    else if (signal === "sell" && currentPosition) {
      const sizeToSell = currentPosition.size;
      if (!sizeToSell.isFinite() || sizeToSell.lte(0)) continue;

      const tradeSlippageBps =
        options.slippage?.mode
          ? (computeSlippageBps({
              bars,
              index: i,
              side: "sell",
              sizeAbs: sizeToSell.toNumber(),
              cfg: options.slippage,
            }) ?? (options.slippageBps ?? 0))
          : (options.slippageBps ?? 0);

      const fill = applyFill(state, "sell", barClose_D, sizeToSell, feeBps_D, {
        slippageBps: D(tradeSlippageBps) ?? fallbackSlippageBps_D,
      });
      state = reviveLedgerState(fill.state);

      trades.push({
        type: "sell",
        time: bar.t,
        price: barClose_D.toDP(DP.price).toNumber(),
        size: sizeToSell.toDP(DP.size).toNumber(),
        fee: fill.fee.toNumber(),
        slippageBps: Number(tradeSlippageBps),
      });

      if (journal)
        appendTrade(journal, {
          runId,
          time: bar.t,
          side: "sell",
          price: barClose_D.toDP(DP.price).toNumber(),
          size: sizeToSell.toDP(DP.size).toNumber(),
          fee: fill.fee.toNumber(),
          slippageBps: Number(tradeSlippageBps),
        });
    }

    equitySeries_D.push(equity(state, barClose_D));
  }

  // === Métricas finales ===
  const equitySeries = equitySeries_D.map((eq) => eq.toNumber());
  const initialCash_N = D(options.initialCash ?? 10000).toNumber();
  const finalBalance = equitySeries[equitySeries.length - 1];
  const returnTotal = initialCash_N > 0 ? (finalBalance - initialCash_N) / initialCash_N : 0;
  const daysInPeriod = bars.length - startIndex;
  const years = daysInPeriod > 0 ? daysInPeriod / 252 : 0;
  const cagrBase = finalBalance / initialCash_N;
  const cagr = initialCash_N > 0 && cagrBase > 0 && years > 0 ? Math.pow(cagrBase, 1 / years) - 1 : 0;

  const returns: number[] = [];
  for (let i = 1; i < equitySeries.length; i++) {
    const prev = equitySeries[i - 1];
    const r = prev !== 0 ? (equitySeries[i] - prev) / prev : 0;
    if (isFinite(r)) returns.push(r);
  }
  const avg = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const std =
    returns.length > 1
      ? Math.sqrt(returns.map((r) => Math.pow(r - avg, 2)).reduce((a, b) => a + b, 0) / (returns.length - 1))
      : 0;
  const sharpe = std > 0 ? (avg / std) * Math.sqrt(252) : 0;

  let peak = -Infinity;
  let mdd = 0;
  for (const eq of equitySeries) {
    if (eq > peak) peak = eq;
    const dd = peak > 0 ? (peak - eq) / peak : 0;
    if (dd > mdd) mdd = dd;
  }

  if (journal) {
    const fin = finalizeJournal(journal);
    journalChecksum = fin.checksum;
  }

  // === Crear manifest estándar del motor ===
  createManifest({
    runId,
    engineVersion: "v3.18",
    strategyName: strategy.name ?? "UnnamedStrategy",
    seed: seedUsed,
    options,
    bars,
    checksum,
    journalChecksum,
    metrics: {
      equityFinal: finalBalance,
      returnTotal,
      cagr: isFinite(cagr) ? cagr : 0,
      sharpe: isFinite(sharpe) ? sharpe : 0,
      mdd: isFinite(mdd) ? mdd : 0,
      tradesCount: trades.length,
    },
  });

  console.log(`✅ Backtest completado | runId=${runId} | seed=${seedUsed}`);

  const res = {
    equityFinal: finalBalance,
    returnTotal,
    cagr,
    sharpe,
    mdd,
    trades,
    equitySeries,
    runId,
    journalChecksum,
  };

  // ============================================================
  // 🧠 OMEGA Exporter — Guardado automático de auditoría + manifest
  // ============================================================
  try {
    const baseDir = path.join(process.cwd(), "results");
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const folder = path.join(baseDir, `${timestamp}_${strategy.name ?? "UnnamedStrategy"}`);
    fs.mkdirSync(folder, { recursive: true });

    // auditoria.csv
    const csvPath = path.join(folder, "auditoria.csv");
    const metrics = {
      equityFinal: res.equityFinal,
      returnTotal: res.returnTotal,
      cagr: res.cagr,
      sharpe: res.sharpe,
      mdd: res.mdd,
      tradesCount: res.trades.length,
    };
    const csvHeaders = Object.keys(metrics);
    const csvValues = Object.values(metrics);
    const csvContent = [csvHeaders.join(","), csvValues.join(",")].join("\n");
    fs.writeFileSync(csvPath, csvContent, "utf8");

    // manifest.json
    const manifest = {
      strategy: strategy.name ?? "UnnamedStrategy",
      timestamp,
      runId,
      params: (strategy as any).params ?? {},
      metrics,
      notes: "Archivo generado automáticamente por OMEGA Quantum Engine",
    };
    fs.writeFileSync(
      path.join(folder, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf8"
    );

    console.log(`🧾 Auditoría guardada en: ${folder}`);
  } catch (err) {
    console.error("❌ Error guardando resultados del backtest:", err);
  }

  return res;
}

// src/core/replay.ts (v1.0 - Deterministic Replay)
import type { Bar, Strategy } from "./types.js";
import { runBacktest } from "./engine.js";
import { loadManifest, computeBarsChecksum } from "./manifest.js";

/**
 * Reproduce un backtest anterior usando el manifest guardado.
 * - Valida que la estrategia coincida (por nombre).
 * - Valida que el dataset sea idéntico (checksum).
 * - Ejecuta runBacktest con la misma seed y opciones.
 * - Compara métricas clave y reporta veredicto.
 */
export async function runBacktestReplay(
  manifestPath: string,
  bars: Bar[],
  strategy: Strategy,
  { strict = true }: { strict?: boolean } = {}
) {
  const mf = loadManifest(manifestPath);

  // 1) Validación de estrategia
  if (strategy.name !== mf.strategy) {
    const msg = `Estrategia distinta: manifest="${mf.strategy}" vs actual="${strategy.name}"`;
    if (strict) throw new Error(msg);
    else console.warn("⚠️", msg);
  }

  // 2) Validación de datos (checksum)
  const checksumNow = computeBarsChecksum(bars);
  if (checksumNow !== mf.data.checksum) {
    const msg = `Checksum de datos no coincide.\nManifest: ${mf.data.checksum}\nActual:   ${checksumNow}`;
    if (strict) throw new Error(msg);
    else console.warn("⚠️", msg);
  }

  // 3) Ejecutar con la misma seed + opciones
  const options = { ...mf.options, seed: mf.seed as any };
  const result = runBacktest(bars, strategy, options);

  // 4) Comparar métricas clave
  const keys = ["equityFinal", "returnTotal", "cagr", "sharpe", "sortino", "mdd"];
  let ok = true;
  const diffs: Record<string, { manifest: number; actual: number }> = {};

  for (const k of keys) {
    const a = Number(mf.metrics[k]);
    const b = Number((result as any)[k]);
    // tolerancia numérica mínima por redondeos
    const same = Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-12;
    if (!same) {
      ok = false;
      diffs[k] = { manifest: a, actual: b };
    }
  }

  if (ok) {
    console.log("✅ REPLAY OK — resultado idéntico a manifest.");
  } else {
    console.warn("⚠️ REPLAY DIFERENCIAS:", diffs);
    if (strict) throw new Error("Replay no coincide con manifest (strict=true).");
  }

  return { manifest: mf, result, ok, diffs };
}

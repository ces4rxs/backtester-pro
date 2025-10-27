// src/core/manifest.ts (v1.4 - Reproducibility Seal + Meta + Integrity Hash)
import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface ManifestInput {
  runId: string;
  engineVersion: string;
  strategyName: string;
  seed: number | string;
  options: Record<string, any>;
  bars: any[];
  metrics: Record<string, any>;
  checksum?: string;
  journalChecksum?: string;
}

export interface Manifest {
  runId: string;
  timestamp: string;
  engineVersion: string;
  strategy: string;
  seed: number | string;
  options: Record<string, any>;
  data: {
    bars: number;
    start: number | null;
    end: number | null;
    checksum: string;
  };
  metrics: Record<string, any>;
  artifacts?: { journalChecksum?: string };
  integrityHash: string;   // ✅ nuevo hash global de integridad
  digitalSeal: string;
}

function stableStringify(obj: any): string {
  const seen = new WeakSet();
  const sort = (x: any): any => {
    if (x && typeof x === "object") {
      if (seen.has(x)) return null;
      seen.add(x);
      if (Array.isArray(x)) return x.map(sort);
      return Object.keys(x).sort().reduce((acc: any, k) => {
        acc[k] = sort(x[k]);
        return acc;
      }, {});
    }
    return x;
  };
  return JSON.stringify(sort(obj));
}

function sha256(payload: string | Buffer) {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function computeBarsChecksum(bars: any[]): string {
  const payload = JSON.stringify(
    bars.map((b) => ({ t: b?.t, o: b?.o, h: b?.h, l: b?.l, c: b?.c, v: b?.v }))
  );
  return sha256(payload);
}

function computeManifestSeal(manifestWithoutSeal: Omit<Manifest, "digitalSeal">): string {
  const payload = stableStringify(manifestWithoutSeal);
  return sha256(payload);
}

export function createManifest(data: ManifestInput): Manifest {
  const checksum = data.checksum ?? computeBarsChecksum(data.bars);

  // Hashes adicionales para reproducibilidad total
  const optionsHash = sha256(stableStringify(data.options));
  const metricsHash = sha256(stableStringify(data.metrics));
  const integrityHash = sha256(stableStringify({ checksum, optionsHash, metricsHash }));

  const base: Omit<Manifest, "digitalSeal"> = {
    runId: data.runId,
    timestamp: new Date().toISOString(),
    engineVersion: data.engineVersion,
    strategy: data.strategyName,
    seed: data.seed,
    options: data.options,
    data: {
      bars: data.bars.length,
      start: data.bars[0]?.t ?? null,
      end: data.bars[data.bars.length - 1]?.t ?? null,
      checksum,
    },
    metrics: data.metrics,
    artifacts: data.journalChecksum ? { journalChecksum: data.journalChecksum } : undefined,
    integrityHash,
  };

  const digitalSeal = computeManifestSeal(base);
  const manifest: Manifest = { ...base, digitalSeal };

  // ✅ Carpeta organizada /reports/manifests/
  const dir = path.join("./reports", "manifests");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const manifestPath = path.join(dir, `${data.runId}.manifest.json`);
  const metaPath = path.join(dir, `${data.runId}.meta.json`);

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // 🧩 Archivo meta para listados rápidos
  const meta = {
    runId: data.runId,
    engineVersion: data.engineVersion,
    strategy: data.strategyName,
    timestamp: manifest.timestamp,
    equityFinal: data.metrics.equityFinal,
    cagr: data.metrics.cagr,
    sharpe: data.metrics.sharpe,
    mdd: data.metrics.mdd,
    trades: data.metrics.tradesCount,
    integrityHash,
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  console.log(`📜 Manifest guardado en: ${manifestPath}`);
  console.log(`🧩 Meta guardado en: ${metaPath}`);
  return manifest;
}

export function loadManifest(path: string): Manifest {
  const raw = fs.readFileSync(path, "utf8");
  return JSON.parse(raw) as Manifest;
}

export function verifyManifestSeal(manifest: Manifest): boolean {
  const { digitalSeal, ...rest } = manifest as any;
  const expected = computeManifestSeal(rest);
  return expected === digitalSeal;
}

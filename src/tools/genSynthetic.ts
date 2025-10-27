// src/tools/genSynthetic.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Bar = { t: number; o: number; h: number; l: number; c: number; v: number };

// Utilidad para clamp
const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));

// Random normal ~N(0,1) (Box–Muller)
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Genera 240 días con 3 regímenes: tendencia alcista, rango, y corrección
function generateSeries(days = 240, start = 42000): Bar[] {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now() - days * DAY_MS;

  // Regímenes (drift, vol)
  const regimes = [
    { len: Math.floor(days * 0.45), drift: 0.0009, vol: 0.012 }, // alcista
    { len: Math.floor(days * 0.35), drift: 0.0001, vol: 0.006 }, // rango
    { len: days,                    drift: -0.0006, vol: 0.015 }, // corrección
  ];

  const out: Bar[] = [];
  let t = now;
  let c = start;

  let used = 0;
  for (const r of regimes) {
    const take = Math.min(r.len, days - used);
    for (let i = 0; i < take; i++) {
      // Modelo GBM discreto con drift+vol y ruido
      const ret = r.drift + r.vol * randn() * 0.9;
      const prevClose = c;
      c = Math.max(200, prevClose * (1 + ret));

      // OHLC a partir del close con micro-ruido intradiario
      const spread = Math.max(20, prevClose * (0.0015 + Math.abs(ret) * 0.8));
      const o = clamp(prevClose + randn() * spread * 0.1, 200, prevClose * 1.2);
      const h = Math.max(o, c) + Math.abs(randn()) * spread * 0.3;
      const l = Math.min(o, c) - Math.abs(randn()) * spread * 0.3;
      const v = Math.round(900 + Math.abs(randn()) * 600 + (r.vol * 4000));

      out.push({ t, o: Math.round(o), h: Math.round(h), l: Math.round(l), c: Math.round(c), v });
      t += DAY_MS;
    }
    used += take;
    if (used >= days) break;
  }

  return out;
}

(function main() {
  const bars = generateSeries(240, 42000);
  const dataDir = path.join(__dirname, "..", "data");
  const file = path.join(dataDir, "sample_btc_usd_1d.json");

  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(bars, null, 2));
  console.log("✅ Dataset sintético generado:", file);
  console.log("📊 Total de barras:", bars.length);
})();

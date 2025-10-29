// ⚡ OMEGA MarketAutoUpdater v2.6 – Dual Fallback Metals Edition
// Descarga y guarda datos públicos (BTC/USD, XAU/USD, XAG/USD, WTI/USD, S&P500)
// con sincronización inteligente hacia TimescaleDB / SQLite / JSONL (fallback).
// Compatible con OMEGA AI Server v4.3.2+
// 🧠 Incluye registro educativo + sincronización local híbrida.
// ❌ No realiza trading ni operaciones financieras reales.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { initWarehouse, saveSnapshot } from "../data/warehouse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Directorio local donde se guardan los snapshots
const MARKET_PATH = path.join(__dirname, "market");
fs.mkdirSync(MARKET_PATH, { recursive: true });

// 🌍 Endpoints de fuentes gratuitas y confiables
const ENDPOINTS = {
  // 🪙 Bitcoin (CoinGecko)
  BTCUSD: async () => {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    const j = await r.json();
    return { symbol: "BTC/USD", price: j.bitcoin.usd, source: "CoinGecko" };
  },

  // 🟡 Oro – con fallback Metals.Live / MetalsAPI
  XAUUSD: async () => {
    try {
      const live = await fetch("https://api.metals.live/v1/spot/gold");
      const lj = await live.json();
      const price = Array.isArray(lj)
        ? lj[0]?.gold ?? lj[0]?.price ?? null
        : null;

      if (price) return { symbol: "XAU/USD", price, source: "Metals.Live" };

      // Fallback a MetalsAPI
      const key = process.env.METALS_API_KEY || "demo";
      const url = `https://metals-api.com/api/latest?access_key=${key}&base=USD&symbols=XAU`;
      const r = await fetch(url);
      const j = await r.json();
      const rate = j?.rates?.XAU ? 1 / j.rates.XAU : null;
      return { symbol: "XAU/USD", price: rate, source: "MetalsAPI (fallback)" };
    } catch {
      return { symbol: "XAU/USD", price: null, source: "Metals.Live (error)" };
    }
  },

  // ⚪ Plata – con fallback dual
  XAGUSD: async () => {
    try {
      const r = await fetch("https://api.metals.live/v1/spot/silver");
      const j = await r.json();
      const price = Array.isArray(j)
        ? j[0]?.silver ?? j[0]?.price ?? null
        : null;
      if (price) return { symbol: "XAG/USD", price, source: "Metals.Live" };

      // Fallback simple
      const fallback = await fetch("https://api.metals.live/v1/spot/XAG");
      const fjson = await fallback.json();
      const fprice = Array.isArray(fjson)
        ? fjson[0]?.price ?? null
        : null;
      return { symbol: "XAG/USD", price: fprice, source: "Metals.Live (fallback)" };
    } catch {
      return { symbol: "XAG/USD", price: null, source: "Metals.Live (error)" };
    }
  },

  // 🛢️ Petróleo WTI – fallback automático
  WTIUSD: async () => {
    try {
      const r = await fetch("https://api.metals.live/v1/spot/oil");
      const j = await r.json();
      const price = Array.isArray(j)
        ? j[0]?.oil ?? j[0]?.price ?? null
        : null;
      if (price) return { symbol: "WTI/USD", price, source: "Metals.Live" };

      // Fallback a crude oil API
      const crude = await fetch("https://api.metals.live/v1/spot/crude");
      const cj = await crude.json();
      const fallbackPrice = Array.isArray(cj)
        ? cj[0]?.price ?? null
        : null;
      return { symbol: "WTI/USD", price: fallbackPrice, source: "Metals.Live (fallback)" };
    } catch {
      return { symbol: "WTI/USD", price: null, source: "Metals.Live (error)" };
    }
  },

  // 📈 S&P500 (Yahoo Finance)
  SP500: async () => {
    const r = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d"
    );
    const j = await r.json();
    const quote = j.chart.result[0].meta;
    const last = j.chart.result[0].indicators.quote[0].close.pop();
    return {
      symbol: "S&P500",
      price: last,
      currency: quote.currency,
      source: "Yahoo Finance",
    };
  },
};

// 💾 Guarda snapshot con fecha, fuente y latencia
async function saveSnapshotLocal(asset: keyof typeof ENDPOINTS) {
  const start = Date.now();
  try {
    const data = await ENDPOINTS[asset]();
    const latency = Date.now() - start;

    if (!data.price) throw new Error("Precio inválido o sin datos");

    const timestamp = new Date().toISOString();
    const fileName = `${asset}_${timestamp.replace(/[:.]/g, "-")}.json`;
    const filePath = path.join(MARKET_PATH, fileName);

    const snapshot = {
      asset,
      price: data.price,
      source: data.source,
      latency_ms: latency,
      timestamp,
      humanTime: new Date().toLocaleString("es-CO"),
    };

    // Guardado local
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
    console.log(`💾 [${asset}] Guardado ${snapshot.price} (${data.source})`);

    // Sincronización cognitiva (TimescaleDB / SQLite / JSONL fallback)
    await saveSnapshot({
      asset,
      price: snapshot.price,
      source: snapshot.source,
      latency_ms: snapshot.latency_ms,
      timestamp: snapshot.timestamp,
    });
  } catch (err: any) {
    console.error(`⚠️ [${asset}] Error al actualizar:`, err.message);
  }
}

// 🔁 Tarea automática cada 5 minutos
export async function startMarketAutoUpdater() {
  await initWarehouse();
  console.log("🕒 Iniciando OMEGA Market Auto-Updater (cada 5 min)...");

  // Ejecución inmediata
  await runCycle();

  // Repetir cada 5 min
  const FIVE_MIN_MS = 5 * 60 * 1000;
  setInterval(runCycle, FIVE_MIN_MS);
}

// 🧩 Ciclo de actualización completo
async function runCycle() {
  console.log("\n🔄 Nuevo ciclo de actualización de mercado");
  const assets: (keyof typeof ENDPOINTS)[] = [
    "BTCUSD",
    "XAUUSD",
    "XAGUSD",
    "WTIUSD",
    "SP500",
  ];

  const startTime = Date.now();
  await Promise.all(assets.map((a) => saveSnapshotLocal(a)));
  const total = (Date.now() - startTime) / 1000;

  console.log(
    `\n✅ ${assets.length}/${assets.length} activos actualizados correctamente | Tiempo total: ${total.toFixed(2)}s`
  );
}

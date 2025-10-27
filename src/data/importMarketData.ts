// 🔥 OMEGA Market Data Importer v1.3 (Hybrid AutoSource + Smart Fallback)
// Corrección total XAUUSD + integración opcional con Metals-API y Metals.Live
// Compatible con Omega AI Server v4.3.2 y AutoUpdater

import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import type { Bar } from "../core/types.js";
import { saveSnapshot, initWarehouse } from "../data/warehouse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Configuración ===
type AssetType = "BTCUSD" | "XAUUSD" | "SP500" | "XAGUSD" | "WTIUSD";

const BINANCE_URL = "https://api.binance.com/api/v3/klines";
const YAHOO_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const METALS_LIVE_BASE = "https://api.metals.live/v1/spot";
const METALS_API_BASE = "https://metals-api.com/api";

// === Archivos locales de respaldo ===
const LOCAL_DATA: Record<AssetType, string> = {
  BTCUSD: path.join(__dirname, "sample_btc_usd_1d.json"),
  XAUUSD: path.join(__dirname, "sample_gold_usd_1d.json"),
  SP500: path.join(__dirname, "sample_sp500_usd_1d.json"),
  XAGUSD: path.join(__dirname, "sample_silver_usd_1d.json"),
  WTIUSD: path.join(__dirname, "sample_oil_usd_1d.json"),
};

// === Normalizador universal ===
function normalizeBars(data: any[], source: string): Bar[] {
  if (source === "binance") {
    return data.map((d) => ({
      t: Number(d[0]),
      o: Number(d[1]),
      h: Number(d[2]),
      l: Number(d[3]),
      c: Number(d[4]),
      v: Number(d[5]),
    }));
  }

  if (source === "yahoo") {
    const timestamps = data.chart.result[0].timestamp;
    const quotes = data.chart.result[0].indicators.quote[0];
    return timestamps.map((t: number, i: number) => ({
      t: t * 1000,
      o: quotes.open[i],
      h: quotes.high[i],
      l: quotes.low[i],
      c: quotes.close[i],
      v: quotes.volume[i],
    }));
  }

  if (source === "metals") {
    return data.map((d: any) => ({
      t: d.t,
      o: d.o,
      h: d.h,
      l: d.l,
      c: d.c,
      v: 0,
    }));
  }

  throw new Error("Fuente desconocida");
}

// === Lógica principal ===
export async function loadMarketData(asset: AssetType): Promise<Bar[]> {
  try {
    switch (asset) {
      // Bitcoin — Binance
      case "BTCUSD": {
        console.log("🔗 Descargando BTC/USD desde Binance...");
        const { data } = await axios.get(BINANCE_URL, {
          params: { symbol: "BTCUSDT", interval: "1d", limit: 1000 },
        });
        console.log(`✅ ${data.length} velas obtenidas desde Binance`);
        return normalizeBars(data, "binance");
      }

      // Oro — Hybrid: Metals.Live -> Metals-API -> local
      case "XAUUSD": {
        console.log("🔗 Descargando Oro (XAU/USD) desde Metals.Live...");
        try {
          const { data } = await axios.get(`${METALS_LIVE_BASE}/gold`);
          const item = Array.isArray(data) ? data[0] : {};
          const price =
            item.goldPrice ??
            item.price ??
            item.gold ??
            item.value ??
            item.ask ??
            item.bid ??
            null;
          if (!price) throw new Error("Formato desconocido");

          const now = Date.now();
          const gold = [{ t: now, o: price, h: price, l: price, c: price }];
          console.log(`✅ Precio actual del Oro: ${price} USD/oz (Metals.Live)`);
          return normalizeBars(gold, "metals");
        } catch (err) {
          // Segundo intento: Metals-API (requiere API Key)
          const apiKey = process.env.METALS_API_KEY;
          if (apiKey) {
            console.log("🔁 Fallback: consultando Metals-API...");
            const { data } = await axios.get(`${METALS_API_BASE}/latest`, {
              params: { access_key: apiKey, base: "USD", symbols: "XAU" },
            });
            const price = data?.rates?.XAU;
            if (!price) throw new Error("Sin datos de Metals-API");
            const now = Date.now();
            const gold = [{ t: now, o: price, h: price, l: price, c: price }];
            console.log(`✅ Precio actual del Oro: ${price} USD/oz (Metals-API)`);
            return normalizeBars(gold, "metals");
          }
          throw new Error("Fuentes de Oro agotadas");
        }
      }

      // Plata — Metals.Live
      case "XAGUSD": {
        console.log("🔗 Descargando Plata (XAG/USD) desde Metals.Live...");
        const { data } = await axios.get(`${METALS_LIVE_BASE}/silver`);
        const item = Array.isArray(data) ? data[0] : {};
        const price = item.price ?? item.silver ?? item.value ?? null;
        if (!price) throw new Error("Sin datos de plata");
        const now = Date.now();
        const silver = [{ t: now, o: price, h: price, l: price, c: price }];
        console.log(`✅ Precio actual de la Plata: ${price} USD/oz`);
        return normalizeBars(silver, "metals");
      }

      // Petróleo — Metals.Live
      case "WTIUSD": {
        console.log("🔗 Descargando Petróleo (WTI/USD) desde Metals.Live...");
        const { data } = await axios.get(`${METALS_LIVE_BASE}/oil`);
        const item = Array.isArray(data) ? data[0] : {};
        const price = item.price ?? item.oil ?? item.value ?? null;
        if (!price) throw new Error("Sin datos de petróleo");
        const now = Date.now();
        const oil = [{ t: now, o: price, h: price, l: price, c: price }];
        console.log(`✅ Precio actual del Petróleo WTI: ${price} USD/barril`);
        return normalizeBars(oil, "metals");
      }

      // S&P500 — Yahoo Finance
      case "SP500": {
        console.log("🔗 Descargando S&P500 desde Yahoo Finance...");
        const { data } = await axios.get(`${YAHOO_URL}/^GSPC`, {
          params: { range: "1y", interval: "1d" },
        });
        console.log("✅ Datos del S&P500 obtenidos correctamente");
        return normalizeBars(data, "yahoo");
      }

      default:
        throw new Error(`Activo no soportado: ${asset}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ Error al descargar ${asset}: ${err.message}`);
    console.log("📂 Cargando dataset local...");
    const file = LOCAL_DATA[asset];
    if (!fs.existsSync(file))
      throw new Error(`Archivo local no encontrado: ${file}`);
    const bars = JSON.parse(fs.readFileSync(file, "utf8"));
    console.log(`✅ Dataset local cargado: ${bars.length} velas`);
    return bars;
  }
}

// === Debug Local ===
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    const bars = await loadMarketData("XAUUSD");
    console.log(`📊 Total de velas descargadas: ${bars.length}`);
    console.log("🧩 Datos recientes:", bars.slice(0, 1));
  })();
}

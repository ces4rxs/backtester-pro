// runDataGuard.ts — Prueba híbrida con DataGuard + Market Importer
// 100% compatible con OMEGA v10.3-B (sin alterar el motor principal)
import { validateBars } from "./core/data.guard.js";
import { loadMarketData } from "./data/importMarketData.js"; // 🧠 Nuevo import
// -------------------------------------------------------------------
// 🧩 CONFIGURACIÓN
const USE_REAL_DATA = true; // ← cambia a false si quieres modo offline puro
const ASSET = "BTCUSD"; // oro, btc o sp500
// -------------------------------------------------------------------
async function main() {
    let bars;
    if (USE_REAL_DATA) {
        try {
            console.log(`🌎 Intentando importar datos reales de ${ASSET}...`);
            bars = await loadMarketData(ASSET);
            console.log(`✅ ${bars.length} velas obtenidas de ${ASSET}`);
        }
        catch (err) {
            console.warn("⚠️ Error en modo online, usando dataset local:", err.message);
            const local = "./data/sample_btc_usd_1d.json";
            bars = JSON.parse(await Bun.file(local).text());
        }
    }
    else {
        // 🔒 Modo manual: dataset fijo (igual que antes)
        bars = [
            { t: 0, o: "100", h: "100", l: "100", c: "100", v: "1000" },
            { t: 1, o: "100.1", h: "100.1", l: "100.1", c: "100.1", v: "1000" },
            { t: 2, o: "100.2", h: "100.2", l: "100.2", c: "100.2", v: "1000" },
        ];
    }
    // --- Valida el dataset con DataGuard (igual que antes) ---
    const report = validateBars(bars, {
        strict: true,
        expectSorted: true,
        allowEqualTimestamps: false,
        maxGap: null,
    });
    console.log("\n--- 🧮 DataGuard Report ---");
    console.log(JSON.stringify(report, null, 2));
}
// 🚀 Ejecutar
main().catch((err) => console.error("❌ Error general:", err));

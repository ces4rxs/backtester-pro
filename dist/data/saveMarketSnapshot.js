// src/data/saveMarketSnapshot.ts
// 📦 Guarda datasets validados (BTC, Oro, Nasdaq, etc.) en formato estándar OMEGA
import fs from "fs";
import path from "path";
/**
 * Guarda los datos de mercado descargados en formato JSON.
 * No toca el motor ni las rutas existentes.
 */
export async function saveMarketSnapshot(symbol, timeframe, bars) {
    const dir = path.join(process.cwd(), "data", "market");
    // Crear la carpeta /data/market si no existe
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    // Nombre del archivo: BTCUSD_1d_2025-10-25.json
    const fileName = `${symbol}_${timeframe}_${new Date()
        .toISOString()
        .split("T")[0]}.json`;
    const fullPath = path.join(dir, fileName);
    // Guardar los datos en formato legible
    fs.writeFileSync(fullPath, JSON.stringify(bars, null, 2), "utf-8");
    console.log(`✅ Dataset guardado: ${fullPath}`);
    console.log(`📊 Velas totales: ${bars.length}`);
}

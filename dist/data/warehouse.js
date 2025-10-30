// 🧠 OMEGA Warehouse Manager v1.2 (PostgreSQL / SQLite / JSONL Fallback)
// Sincronización cognitiva de snapshots de mercado.
// Compatible con OMEGA MarketAutoUpdater v2.5 y Server v4.3.2+.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import Database from "better-sqlite3";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_FILE = path.join(__dirname, "market_snapshots.jsonl");
// === Estado global ===
let backend = "jsonl";
let pool = null;
let db = null;
let warehouseReady = false; // ✅ <-- aquí estaba el error (debe existir globalmente)
// === Inicialización principal ===
export async function initWarehouse() {
    const url = process.env.WAREHOUSE_DATABASE_URL;
    if (!url) {
        console.warn("⚠️ Warehouse PG no disponible: faltan credenciales o URL");
        console.log("📦 Warehouse en modo archivo JSONL (fallback)");
        await ensureLocalFallback();
        warehouseReady = true;
        return;
    }
    try {
        console.log("🔌 Conectando a Warehouse PostgreSQL...");
        pool = new pg.Pool({ connectionString: url });
        const client = await pool.connect();
        await client.query(`
      CREATE TABLE IF NOT EXISTS omega_market_snapshots (
        id SERIAL PRIMARY KEY,
        asset TEXT NOT NULL,
        price NUMERIC,
        source TEXT,
        latency_ms INTEGER,
        ts TIMESTAMP DEFAULT NOW()
      )
    `);
        client.release();
        backend = "pg";
        warehouseReady = true;
        console.log("✅ Warehouse PostgreSQL conectado correctamente");
    }
    catch (err) {
        console.warn("⚠️ No se pudo conectar al Warehouse PostgreSQL:", err.message);
        console.log("📦 Activando fallback SQLite local...");
        try {
            const sqlitePath = path.join(__dirname, "omega_local.db");
            db = new Database(sqlitePath);
            db.exec(`
        CREATE TABLE IF NOT EXISTS omega_market_snapshots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          asset TEXT,
          price REAL,
          source TEXT,
          latency_ms INTEGER,
          ts DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            backend = "sqlite";
            warehouseReady = true;
            console.log("✅ Warehouse SQLite inicializado correctamente");
        }
        catch (sqliteErr) {
            console.error("❌ Error al iniciar SQLite:", sqliteErr.message);
            console.log("📦 Último recurso: usando archivo JSONL local");
            await ensureLocalFallback();
            backend = "jsonl";
            warehouseReady = true;
        }
    }
}
// === Fallback local (JSONL) ===
async function ensureLocalFallback() {
    if (!fs.existsSync(LOCAL_FILE)) {
        fs.writeFileSync(LOCAL_FILE, "");
        console.log("🗂️ Archivo local JSONL creado:", LOCAL_FILE);
    }
}
// === Guardar snapshot ===
export async function saveSnapshot(snapshot) {
    if (!warehouseReady) {
        await ensureLocalFallback();
    }
    if (backend === "pg" && pool) {
        const client = await pool.connect();
        await client.query("INSERT INTO omega_market_snapshots (asset, price, source, latency_ms, ts) VALUES ($1, $2, $3, $4, NOW())", [snapshot.asset, snapshot.price, snapshot.source, snapshot.latency_ms ?? 0]);
        client.release();
    }
    else if (backend === "sqlite" && db) {
        db.prepare("INSERT INTO omega_market_snapshots (asset, price, source, latency_ms, ts) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)").run(snapshot.asset, snapshot.price, snapshot.source, snapshot.latency_ms ?? 0);
    }
    else {
        // Fallback JSONL
        fs.appendFileSync(LOCAL_FILE, JSON.stringify(snapshot) + "\n");
    }
}

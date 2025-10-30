// src/ai/adaptive.ts
// ------------------------------------------------------
// 🧠 OMEGA — AI Learner (Nivel 2: Construcción de Dataset Unificado)
// Versión: v3.2 (ruta dinámica + autocreación de carpetas + fallback seguro)
// ------------------------------------------------------
import fs from "fs";
import path from "path";
import readline from "readline";
const __dirname_ = path.dirname(new URL(import.meta.url).pathname);
// === 🧩 1. Detectar automáticamente carpeta base de resultados (Windows Safe) ===
function detectResultsDir() {
    const candidates = [
        path.resolve(process.cwd(), "results"),
        path.resolve(__dirname_, "../../results"),
        path.resolve(__dirname_, "../data"),
        path.resolve(__dirname_, "../../data"),
    ];
    for (const dir of candidates) {
        try {
            if (fs.existsSync(dir)) {
                console.log("📂 Carpeta de resultados detectada:", dir);
                return dir;
            }
        }
        catch { }
    }
    const defaultDir = path.join(process.cwd(), "results");
    try {
        fs.mkdirSync(defaultDir, { recursive: true, mode: 0o755 });
        console.log("📁 Carpeta de resultados creada:", defaultDir);
    }
    catch (err) {
        console.error("❌ No se pudo crear carpeta results:", err);
    }
    return defaultDir;
}
const RESULTS_DIR = process.env.AI_RESULTS_DIR || detectResultsDir();
const DATASETS_DIR = path.join(process.cwd(), "src", "ai", "datasets");
const MODELS_DIR = path.join(process.cwd(), "src", "ai", "models");
// === 🧩 2. Utilidades de archivos ===
function ensureDir(dir) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}
function listFilesRecursive(dir) {
    const out = [];
    if (!fs.existsSync(dir))
        return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory())
            out.push(...listFilesRecursive(p));
        else
            out.push(p);
    }
    return out;
}
// === 🧩 3. CSV Parser minimalista ===
async function parseCsvLastRow(file) {
    if (!fs.existsSync(file))
        return null;
    const stream = fs.createReadStream(file, { encoding: "utf8" });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    let headers = null;
    let lastValues = null;
    for await (const line of rl) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        const parts = splitCsvLine(trimmed);
        if (!headers) {
            headers = parts.map((h) => h.trim());
        }
        else {
            lastValues = parts;
        }
    }
    rl.close();
    if (!headers || !lastValues)
        return null;
    const row = {};
    headers.forEach((h, i) => (row[h] = lastValues[i]));
    return row;
}
function splitCsvLine(line) {
    const out = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
            }
            else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (c === "," && !inQuotes) {
            out.push(cur);
            cur = "";
            continue;
        }
        cur += c;
    }
    out.push(cur);
    return out;
}
// === 🧩 4. Normalización de encabezados ===
function normKeyMap(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        const nk = k
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9_]/g, "");
        out[nk] = isNaN(Number(v)) ? v : Number(v);
    }
    return out;
}
function pickFeatures(row) {
    const r = normKeyMap(row);
    const features = {};
    const pick = (aliases, name) => {
        for (const a of aliases) {
            if (r[a] !== undefined && r[a] !== null && r[a] !== "") {
                features[name] = r[a];
                return;
            }
        }
        features[name] = null;
    };
    pick(["sharpe", "sharpescore"], "Sharpe");
    pick(["cagr", "cagrannual"], "CAGR");
    pick(["maxdd", "maxdrawdown", "mdd"], "MaxDD");
    pick(["trades", "numtrades", "counttrades"], "Trades");
    pick(["winrate", "winnersratio"], "WinRate");
    pick(["avgtrade", "avgprofitpertrade"], "AvgTrade");
    pick(["feebps", "feesbps"], "FeeBps");
    pick(["equityfinal", "finalequity"], "EquityFinal");
    return features;
}
// === 🧩 5. Escribir CSV ===
function writeCsv(file, rows) {
    const arr = Array.isArray(rows) ? rows : [rows];
    const headers = Array.from(arr.reduce((set, r) => {
        Object.keys(r ?? {}).forEach((k) => set.add(k));
        return set;
    }, new Set()));
    const lines = [
        headers.join(","),
        ...arr.map((r) => headers
            .map((h) => {
            const val = r[h];
            if (val === null || val === undefined)
                return "";
            const s = String(val);
            if (s.includes(",") || s.includes('"') || s.includes("\n")) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        })
            .join(",")),
    ];
    fs.writeFileSync(file, lines.join("\n"), "utf8");
}
// === 🧩 6. Cargar manifest.json asociado ===
function loadSiblingManifest(auditoriaPath) {
    const manifestPath = auditoriaPath.replace(/auditoria\.csv$/i, "manifest.json");
    if (!fs.existsSync(manifestPath))
        return null;
    try {
        return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    }
    catch {
        return null;
    }
}
// === 🧠 7. Función principal: buildDataset() ===
export async function buildDataset() {
    ensureDir(DATASETS_DIR);
    ensureDir(MODELS_DIR);
    console.log("🔍 Escaneando auditorías en:", RESULTS_DIR);
    const files = listFilesRecursive(RESULTS_DIR).filter((f) => /auditoria\.csv$/i.test(f));
    console.log("🧾 Archivos encontrados:", files.length);
    if (files.length === 0) {
        console.warn("⚠️ No se encontraron auditorias.csv — crea un backtest primero.");
    }
    const dataset = [];
    for (const auditoriaFile of files) {
        const last = await parseCsvLastRow(auditoriaFile);
        if (!last)
            continue;
        const feats = pickFeatures(last);
        const manifest = loadSiblingManifest(auditoriaFile) || {};
        dataset.push({
            _source: path.relative(RESULTS_DIR, auditoriaFile),
            _ts: manifest.timestamp || manifest.date || null,
            strategy: manifest.strategy || manifest.strategyName || null,
            params: manifest.params ? JSON.stringify(manifest.params) : null,
            ...feats,
            RobustScore: manifest.robustScore ?? null,
            Pass: manifest.pass ?? null,
        });
    }
    const jsonPath = path.join(DATASETS_DIR, "dataset.json");
    const csvPath = path.join(DATASETS_DIR, "dataset.csv");
    fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2), "utf8");
    writeCsv(csvPath, dataset);
    const meta = {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        resultsDir: RESULTS_DIR,
        dataset: {
            rows: dataset.length,
            features: [
                "Sharpe",
                "CAGR",
                "MaxDD",
                "Trades",
                "WinRate",
                "AvgTrade",
                "FeeBps",
                "EquityFinal",
            ],
            targetCandidates: ["RobustScore", "Pass"],
        },
        notes: "Archivo meta generado automáticamente por OMEGA AI Learner. Entrenamiento ONNX se hará en el Nivel 3.",
    };
    fs.writeFileSync(path.join(MODELS_DIR, "model.meta.json"), JSON.stringify(meta, null, 2), "utf8");
    console.log(`✅ Dataset construido (${dataset.length} filas)`);
    console.log(`📄 JSON: ${jsonPath}`);
    console.log(`📄 CSV: ${csvPath}`);
    return { count: dataset.length, jsonPath, csvPath };
}
// === CLI ===
if (process.argv[2] === "dataset") {
    buildDataset().catch((e) => {
        console.error("❌ Error construyendo dataset:", e);
        process.exit(1);
    });
}

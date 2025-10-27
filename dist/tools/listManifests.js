// src/tools/listManifests.ts
// 🧾 OMEGA Labs — Auditor de Manifests Inteligente (v1.2)
// ✔️ 100% compatible con v1.1b
// ➕ Añade filtros (--strategy, --since, --summary, --export)
// 🔒 Mantiene validación de firmas, meta y hashes con tolerancia SHA256
import fs from "fs";
import path from "path";
import { loadManifest, verifyManifestSeal } from "../core/manifest.js";
// --- Configuración base ---
const manifestsDir = path.join("./reports", "manifests");
// --- Utilidades ---
function exists(p) {
    try {
        fs.accessSync(p, fs.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
function normalizeHash(h) {
    return (h ?? "").replace(/^sha256:/i, "").trim();
}
function parseArgs() {
    const args = process.argv.slice(2);
    const opts = {};
    for (const arg of args) {
        if (arg.startsWith("--")) {
            const [key, val] = arg.slice(2).split("=");
            opts[key] = val ?? true;
        }
    }
    return opts;
}
// --- Leer argumentos ---
const opts = parseArgs();
const strategyFilter = opts["strategy"]?.toLowerCase();
const sinceDate = opts["since"] ? new Date(opts["since"]) : null;
const summaryMode = Boolean(opts["summary"]);
const exportPath = opts["export"] ? String(opts["export"]) : null;
// --- Validación de carpeta ---
if (!fs.existsSync(manifestsDir)) {
    console.log("⚠️ No se encontró la carpeta reports/manifests/");
    process.exit(0);
}
const manifestFiles = fs
    .readdirSync(manifestsDir)
    .filter((f) => f.endsWith(".manifest.json"))
    .sort();
if (manifestFiles.length === 0) {
    console.log("⚠️ No hay manifests registrados aún.");
    process.exit(0);
}
// --- Contadores globales ---
let total = 0, sealsOk = 0, metaFound = 0, metaMatch = 0;
let filtered = 0;
let metricsSummary = {
    equity: [],
    sharpe: [],
    cagr: [],
};
// --- Export CSV ---
let csvRows = [
    "file,strategy,equityFinal,sharpe,cagr,timestamp,sealOK,metaOK,integrityHash",
];
console.log("📜 LISTADO DE MANIFESTS (v1.2 – Filtros Inteligentes)");
console.log("──────────────────────────────────────────────────────────────────────────────");
console.log("Status Seal | Status Meta | Archivo                                   | Estrategia / Equity / Fecha");
console.log("──────────────────────────────────────────────────────────────────────────────");
for (const file of manifestFiles) {
    const manifestPath = path.join(manifestsDir, file);
    const basename = file.replace(".manifest.json", "");
    const metaPath = path.join(manifestsDir, `${basename}.meta.json`);
    const m = loadManifest(manifestPath);
    const date = new Date(m.timestamp);
    if (sinceDate && date < sinceDate)
        continue;
    if (strategyFilter && !(m.strategy ?? "").toLowerCase().includes(strategyFilter))
        continue;
    filtered++;
    total++;
    const okSeal = verifyManifestSeal(m);
    if (okSeal)
        sealsOk++;
    let metaStatus = "—";
    let metaOk = false;
    if (exists(metaPath)) {
        metaFound++;
        try {
            const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
            const manIH = normalizeHash(m.integrityHash);
            const metaIH = normalizeHash(meta.integrityHash ?? meta.integrity?.hash ?? "");
            metaOk = manIH && metaIH && manIH === metaIH;
            if (metaOk)
                metaMatch++;
            metaStatus = metaOk ? "IH=OK" : "IH≠";
        }
        catch {
            metaStatus = "META_ERR";
        }
    }
    else {
        metaStatus = "NO_META";
    }
    const equity = Number(m.metrics?.equityFinal ?? 0);
    const sharpe = Number(m.metrics?.sharpe ?? 0);
    const cagr = Number(m.metrics?.cagr ?? 0);
    if (equity)
        metricsSummary.equity.push(equity);
    if (sharpe)
        metricsSummary.sharpe.push(sharpe);
    if (cagr)
        metricsSummary.cagr.push(cagr);
    const sealStatus = okSeal ? "✅" : "❌";
    const metaBadge = metaStatus === "IH=OK"
        ? "✅"
        : metaStatus === "IH≠"
            ? "⚠️"
            : metaStatus === "NO_META"
                ? "…"
                : "⚠️";
    console.log(`${sealStatus.padEnd(11)}| ${metaBadge.padEnd(11)}| ${file.padEnd(42)} | ${m.strategy ?? "—"} / ${equity.toFixed(2)} / ${m.timestamp}`);
    csvRows.push(`${file},"${m.strategy ?? ""}",${equity.toFixed(2)},${sharpe.toFixed(4)},${cagr.toFixed(4)},${m.timestamp},${okSeal},${metaOk},"${normalizeHash(m.integrityHash)}"`);
}
// --- Resumen global ---
console.log("──────────────────────────────────────────────────────────────────────────────");
const sealPct = total > 0 ? ((sealsOk / total) * 100).toFixed(1) : "0.0";
const metaPct = total > 0 ? ((metaFound / total) * 100).toFixed(1) : "0.0";
const matchPct = metaFound > 0 ? ((metaMatch / metaFound) * 100).toFixed(1) : "0.0";
console.log(`📦 Manifests listados: ${filtered}`);
console.log(`🔒 Firmas válidas:     ${sealsOk}/${total} (${sealPct}%)`);
console.log(`📝 Meta presentes:     ${metaFound}/${total} (${metaPct}%)`);
console.log(`🔗 Integrity match:    ${metaMatch}/${metaFound} (${matchPct}%)`);
if (summaryMode) {
    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    console.log("\n📊 Estadísticas agregadas:");
    console.log(`  • Promedio Equity: ${avg(metricsSummary.equity).toFixed(2)}\n  • Promedio Sharpe: ${avg(metricsSummary.sharpe).toFixed(4)}\n  • Promedio CAGR:   ${avg(metricsSummary.cagr).toFixed(4)}`);
}
if (exportPath) {
    fs.writeFileSync(exportPath, csvRows.join("\n"), "utf8");
    console.log(`\n💾 Exportado a: ${exportPath}`);
}
console.log("🔍 Auditoría v1.2 completada.");

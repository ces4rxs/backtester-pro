// src/learn/memory_v6.ts — 🧠 OMEGA Memory Core v6 (Long-Term Intelligence Layer)
// 🔒 Compatible con memoryStore.ts — No modifica el flujo previo
import fs from "fs";
import path from "path";
import { loadMemory, saveMemory } from "./memoryStore.js";
const REPORTS_DIR = path.join(process.cwd(), "reports");
const OUTPUT_FILE = path.join(REPORTS_DIR, "memory_summary_v6.json");
// 🔹 Utilidades internas
function isJSONFile(file) {
    return file.endsWith(".json") && !file.includes("manifest");
}
// 🔹 Cargar todos los reportes históricos relevantes
export function loadHistoricalReports() {
    if (!fs.existsSync(REPORTS_DIR)) {
        console.warn("⚠️ Carpeta /reports no encontrada.");
        return [];
    }
    const files = fs.readdirSync(REPORTS_DIR).filter(isJSONFile);
    const reports = [];
    for (const file of files) {
        try {
            const fullPath = path.join(REPORTS_DIR, file);
            const raw = fs.readFileSync(fullPath, "utf8");
            const json = JSON.parse(raw);
            // Validar estructura mínima esperada
            if (json && typeof json === "object" && (json.sharpe || json.goal || json.variants)) {
                reports.push({ file, ...json });
            }
        }
        catch {
            // Ignorar archivos dañados o parciales
            continue;
        }
    }
    return reports;
}
// 🔹 Analiza los reportes y genera muestras de aprendizaje
export function analyzeReports() {
    const reports = loadHistoricalReports();
    const samples = [];
    for (const r of reports) {
        try {
            const strategyId = r.leader?.name || r.strategyId || r.file.replace(".json", "");
            const sample = {
                strategyId,
                sharpe: r.leader?.predictedSharpe || r.sharpePred || r.sharpe || undefined,
                mdd: r.leader?.predictedMDD || r.mddPred || r.mdd || undefined,
                cvar: r.cvar || undefined,
                quantumRating: r.quantumRating || undefined,
                overfitRisk: r.overfitRisk || "MEDIO",
                robustnessProb: r.confidence || r.confidenceScore || undefined,
                labels: [r.goal?.metric || "SHARPE", r.baseStrategy || "UNKNOWN"],
                timestamp: new Date(r.generatedAt || Date.now()).toISOString(),
            };
            samples.push(sample);
        }
        catch {
            // DEBUG: continuar aunque un archivo tenga formato inesperado
            continue;
        }
    }
    return samples;
}
// 🔹 Consolidar memoria v6
export function consolidateMemoryV6() {
    console.log("🧠 Consolidando memoria OMEGA v6...");
    const current = loadMemory();
    const newSamples = analyzeReports();
    // Añadir nuevos samples y evitar duplicados por ID
    const seen = new Set(current.samples.map(s => s.strategyId));
    const mergedSamples = [
        ...current.samples,
        ...newSamples.filter(s => !seen.has(s.strategyId))
    ];
    const updated = {
        version: "v6",
        samples: mergedSamples,
        stats: {
            ...current.stats,
            count: mergedSamples.length,
            ...computeStats(mergedSamples)
        }
    };
    saveMemory(updated);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updated, null, 2));
    console.log(`✅ Memoria consolidada guardada en: ${OUTPUT_FILE}`);
    console.log(`🧩 Total de estrategias registradas: ${updated.stats.count}`);
    console.log(`📊 Sharpe promedio: ${updated.stats.sharpeAvg?.toFixed(3)} | MDD promedio: ${updated.stats.mddAvg?.toFixed(3)}`);
    return updated;
}
// 🔹 Recalcular estadísticas avanzadas
function computeStats(samples) {
    const validSharpe = samples.map(s => s.sharpe).filter(Boolean);
    const validMdd = samples.map(s => s.mdd).filter(Boolean);
    const validConf = samples.map(s => s.robustnessProb).filter(Boolean);
    const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
    return {
        sharpeAvg: avg(validSharpe),
        mddAvg: avg(validMdd),
        robustnessAvg: avg(validConf),
        overfitRiskDist: samples.reduce((acc, s) => {
            acc[s.overfitRisk || "MEDIO"] = (acc[s.overfitRisk || "MEDIO"] || 0) + 1;
            return acc;
        }, {})
    };
}
// 🔹 Ejecutable directo
if (process.argv[1].includes("memory_v6.ts")) {
    consolidateMemoryV6();
}

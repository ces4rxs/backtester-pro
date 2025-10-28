// src/ai/neuralAdvisor_v11.ts — 🧠 Omega Neural Advisor v11 (Reflexive Cognition Core)
// - Sin dependencias externas
// - Compatible con el formato de salida de v9/v10 (summary, mode, stats, insights, recommendations)
// - No rompe nada existente (no modifica v7.1/v9/v10)
import fs from "fs";
import path from "path";
import { loadMemory } from "../learn/memoryStore.js";
import { predictForCurrent } from "./predictor_v4.js";
const safeNum = (x, d = 0) => (typeof x === "number" && isFinite(x) ? x : d);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const toFixedNum = (x, d = 3) => Number(x.toFixed(d));
function quantGrade(score) {
    if (score >= 9)
        return "A+";
    if (score >= 7.5)
        return "A";
    if (score >= 6)
        return "B";
    if (score >= 4)
        return "C";
    return "D";
}
function loadMemoryRecs() {
    try {
        const mem = loadMemory();
        const out = [];
        for (const s of mem?.samples ?? []) {
            out.push({
                Sharpe: safeNum(s.sharpe),
                MaxDD: safeNum(s.mdd),
                CAGR: safeNum(s.cvar ?? s.cagr),
                EquityFinal: safeNum(s.equity),
            });
        }
        return out;
    }
    catch {
        return [];
    }
}
function readLatestManifest() {
    try {
        const resultsDir = path.join(process.cwd(), "results");
        if (!fs.existsSync(resultsDir))
            return null;
        const folders = fs
            .readdirSync(resultsDir)
            .filter((f) => fs.statSync(path.join(resultsDir, f)).isDirectory())
            .sort((a, b) => fs.statSync(path.join(resultsDir, b)).mtimeMs - fs.statSync(path.join(resultsDir, a)).mtimeMs);
        if (!folders.length)
            return null;
        const manifestPath = path.join(resultsDir, folders[0], "manifest.json");
        if (!fs.existsSync(manifestPath))
            return null;
        const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
        return {
            Sharpe: safeNum(m?.metrics?.sharpe),
            MaxDD: safeNum(m?.metrics?.mdd),
            CAGR: safeNum(m?.metrics?.cagr),
            EquityFinal: safeNum(m?.metrics?.equityFinal),
        };
    }
    catch {
        return null;
    }
}
export function generateNeuralAdvisorV11(strategyId) {
    // 1) Base empírica (memoria + último manifest)
    const mem = loadMemoryRecs();
    const latest = readLatestManifest();
    const mSharpe = mean(mem.map((r) => safeNum(r.Sharpe)));
    const mMDD = mean(mem.map((r) => safeNum(r.MaxDD)));
    const mCAGR = mean(mem.map((r) => safeNum(r.CAGR)));
    // 2) Proyección (usa tu predictor v4.4)
    const proj = predictForCurrent();
    const pSharpe = safeNum(proj.predictedSharpe, 1.0);
    const pMDD = safeNum(proj.predictedMDD, -0.02);
    const pCAGR = safeNum(proj.predictedCAGR, 0.03);
    // 3) Fusión reflexiva v11 (memoria 30% + manifest 20% + predicción 50%)
    const lSharpe = safeNum(latest?.Sharpe, pSharpe);
    const lMDD = safeNum(latest?.MaxDD, pMDD);
    const lCAGR = safeNum(latest?.CAGR, pCAGR);
    const wMem = mem.length ? 0.3 : 0.0;
    const wMan = latest ? 0.2 : 0.0;
    const wPred = 1 - (wMem + wMan);
    const fSharpe = toFixedNum(wMem * mSharpe + wMan * lSharpe + wPred * pSharpe, 6);
    const fMDD = toFixedNum(wMem * mMDD + wMan * lMDD + wPred * pMDD, 6);
    const fCAGR = toFixedNum(wMem * mCAGR + wMan * lCAGR + wPred * pCAGR, 6);
    // 4) Índices de calidad (estabilidad / anti-overfit)
    const dispersionSharpe = Math.abs(pSharpe - (mSharpe || pSharpe));
    const dispersionCAGR = Math.abs(pCAGR - (mCAGR || pCAGR));
    const dispersion = Math.max(0.001, (dispersionSharpe + dispersionCAGR) / 2);
    const stabilityIndex = toFixedNum((1 / (1 + Math.abs(fMDD))) * (1 / (1 + dispersion)), 3);
    const sampleBoost = Math.min(1, Math.log10((mem.length || 1) + 10) / 3); // 0..~1
    const antiOverfit = toFixedNum(sampleBoost * (1 / (1 + Math.abs(fMDD))), 3);
    // 5) Puntuación v11 + grade
    const v11Score = toFixedNum((fSharpe * 1.6 + fCAGR * 105) * stabilityIndex * (0.9 + antiOverfit * 0.2), 3);
    const grade = quantGrade(v11Score / 1.25);
    // 6) Insights & recomendaciones
    const insights = [];
    if (dispersionSharpe > 0.4)
        insights.push("Dispersión notable entre memoria y proyección en Sharpe → revisar consistencia.");
    if (Math.abs(fMDD) > 0.12)
        insights.push("Riesgo elevado (MDD) → aplicar límites y stops discretizados.");
    if (antiOverfit < 0.4)
        insights.push("Pocas muestras válidas para robustez → ejecuta más validaciones Monte Carlo.");
    if (!insights.length)
        insights.push("Cohesión reflexiva estable entre historial y proyección.");
    const recs = [
        "Realiza una pasada Monte Carlo con jitter bajo (0.3–0.7%) para validar robustez.",
        "Evalúa regularizar reglas de salida para reducir MDD sin perder CAGR.",
        "Prioriza escenarios/activos donde la dispersión memoria↔proyección sea mínima.",
    ];
    return {
        summary: "Omega Neural Advisor v11 — Reflexive Cognition Core",
        mode: "v11",
        stats: {
            projectedSharpe: fSharpe,
            projectedMDD: fMDD,
            projectedCAGR: fCAGR,
            stabilityIndex,
            antiOverfit,
            v11Score,
            quantGrade: grade,
            samples: mem.length,
        },
        insights,
        recommendations: recs,
        note: "Módulo v11 educativo: no implica señales de inversión ni ejecución real.",
        compatibility: {
            reads: ["results/*/manifest.json", "learn/memoryStore"],
            reliesOn: ["predictor_v4.ts"],
            doesNotModify: ["v7.1", "v9", "v10"],
        },
    };
}

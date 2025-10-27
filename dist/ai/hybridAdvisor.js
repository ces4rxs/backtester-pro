// src/ai/hybridAdvisor.ts — 🧠 Omega Learn v7.1 + v9 + v10 (Symbiont)
// Mantiene v7.1 (Hybrid) y v9 (Synaptic) intactos. Agrega v10 (Symbiont).
import fs from "fs";
import path from "path";
import { loadMemory } from "../learn/memoryStore.js";
import { generateAdvice } from "../learn/learner.js";
import { loadBrainprint } from "./userBrainprint.js"; // 🆕 v10
const safeNum = (x, def = 0) => (typeof x === "number" && isFinite(x) ? x : def);
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const toFixedNum = (x, d = 3) => Number(x.toFixed(d));
function normalizeToArray(value) {
    if (Array.isArray(value))
        return value;
    if (value && typeof value === "object")
        return [value];
    return [];
}
// Similitud heurística entre estrategias
function similarity(a, b) {
    const w = { Sharpe: 0.45, MaxDD: 0.3, CAGR: 0.25 };
    const dSharpe = Math.abs(safeNum(a.Sharpe) - safeNum(b.Sharpe));
    const dMDD = Math.abs(safeNum(a.MaxDD) - safeNum(b.MaxDD));
    const dCAGR = Math.abs(safeNum(a.CAGR) - safeNum(b.CAGR));
    const dist = w.Sharpe * dSharpe + w.MaxDD * dMDD + w.CAGR * dCAGR;
    return 1 / (1 + dist);
}
// ---------- Lectores ----------
function loadDatasetRecords() {
    try {
        const datasetPath = path.join(process.cwd(), "src", "ai", "datasets", "dataset.json");
        if (!fs.existsSync(datasetPath))
            return [];
        const raw = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
        const rows = normalizeToArray(raw);
        return rows.map((r) => ({
            Sharpe: safeNum(r.Sharpe),
            MaxDD: safeNum(r.MaxDD),
            CAGR: safeNum(r.CAGR),
            EquityFinal: safeNum(r.EquityFinal),
        }));
    }
    catch (e) {
        console.warn("⚠️ [v7.1] No se pudo leer dataset.json:", e.message);
        return [];
    }
}
function loadMemoryRecords() {
    try {
        const mem = loadMemory();
        const recs = [];
        for (const s of mem.samples ?? []) {
            recs.push({
                Sharpe: safeNum(s.sharpe),
                MaxDD: safeNum(s.mdd),
                CAGR: safeNum(s.cagr),
                EquityFinal: safeNum(s.equity),
            });
        }
        return recs;
    }
    catch (e) {
        console.warn("⚠️ [v7.1] No se pudo leer memoryStore:", e.message);
        return [];
    }
}
// ---------- Clasificación QuantGrade ----------
function computeQuantGrade(score) {
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
// ---------- Núcleo Principal v7.1 ----------
export function generateUnifiedAdviceHybrid(strategyId, mode = "hybrid") {
    const datasetRecs = loadDatasetRecords();
    const memoryRecs = loadMemoryRecords();
    // Estadísticas de cada fuente
    const ds = {
        meanSharpe: mean(datasetRecs.map((r) => safeNum(r.Sharpe))),
        meanMDD: mean(datasetRecs.map((r) => safeNum(r.MaxDD))),
        meanCAGR: mean(datasetRecs.map((r) => safeNum(r.CAGR))),
        meanEquity: mean(datasetRecs.map((r) => safeNum(r.EquityFinal))),
        count: datasetRecs.length,
    };
    const ms = {
        meanSharpe: mean(memoryRecs.map((r) => safeNum(r.Sharpe))),
        meanMDD: mean(memoryRecs.map((r) => safeNum(r.MaxDD))),
        meanCAGR: mean(memoryRecs.map((r) => safeNum(r.CAGR))),
        meanEquity: mean(memoryRecs.map((r) => safeNum(r.EquityFinal))),
        count: memoryRecs.length,
    };
    // Selección de fuente
    let statsSrc = "hybrid";
    if (mode !== "hybrid")
        statsSrc = mode;
    if (statsSrc === "dataset" && ds.count === 0)
        statsSrc = "memory";
    if (statsSrc === "memory" && ms.count === 0)
        statsSrc = "dataset";
    // Pesos dinámicos
    const total = ds.count + ms.count || 1;
    const wDS = statsSrc === "hybrid" ? ds.count / total : statsSrc === "dataset" ? 1 : 0;
    const wMS = statsSrc === "hybrid" ? ms.count / total : statsSrc === "memory" ? 1 : 0;
    const meanSharpe = toFixedNum(wDS * ds.meanSharpe + wMS * ms.meanSharpe, 6);
    const meanMDD = toFixedNum(wDS * ds.meanMDD + wMS * ms.meanMDD, 6);
    const meanCAGR = toFixedNum(wDS * ds.meanCAGR + wMS * ms.meanCAGR, 6);
    const meanEquity = toFixedNum(wDS * ds.meanEquity + wMS * ms.meanEquity, 6);
    // Muestra actual
    let current = null;
    try {
        const mem = loadMemory();
        current =
            (mem.samples ?? []).find((s) => s.strategyId === strategyId) ||
                (mem.samples ?? [])[(mem.samples?.length ?? 1) - 1];
    }
    catch { }
    // Robusteza + QuantGrade
    const riskScore = Math.abs(meanMDD);
    const performanceScore = meanSharpe * 1.2 + meanCAGR * 100;
    const robustnessScore = toFixedNum((1 / (1 + riskScore)) * performanceScore, 3);
    const quantGrade = computeQuantGrade(robustnessScore);
    // Recomendaciones base
    const baseRecs = [];
    try {
        if (current) {
            const mem = loadMemory();
            const base = generateAdvice({
                strategyId,
                sharpe: current.sharpe ?? current.Sharpe,
                mdd: current.mdd ?? current.MaxDD,
                cvar: current.cvar,
                quantumRating: current.quantumRating,
                overfitRisk: current.overfitRisk,
                robustnessProb: current.robustnessProb,
            }, mem);
            baseRecs.push(...(base?.details ?? []));
        }
    }
    catch { }
    // Comparativas de vecinos
    const compRecs = [];
    if (current) {
        const cur = {
            Sharpe: safeNum(current.sharpe ?? current.Sharpe),
            MaxDD: safeNum(current.mdd ?? current.MaxDD),
            CAGR: safeNum(current.cagr ?? current.CAGR),
        };
        const all = [...datasetRecs, ...memoryRecs];
        const ranked = all
            .map((r) => ({ r, score: similarity(cur, r) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        const neighSharpe = mean(ranked.map((x) => safeNum(x.r.Sharpe)));
        const neighMDD = mean(ranked.map((x) => safeNum(x.r.MaxDD)));
        const neighCAGR = mean(ranked.map((x) => safeNum(x.r.CAGR)));
        if (safeNum(cur.Sharpe) < neighSharpe - 0.1)
            compRecs.push(`Tu Sharpe (${toFixedNum(safeNum(cur.Sharpe), 2)}) está por debajo del grupo similar (${toFixedNum(neighSharpe, 2)}). Ajusta filtros o gestión de riesgo.`);
        if (safeNum(cur.MaxDD) < neighMDD)
            compRecs.push(`Tu MaxDD (${toFixedNum(safeNum(cur.MaxDD), 2)}) es peor que la media similar (${toFixedNum(neighMDD, 2)}). Aplica stops dinámicos o reduce exposición.`);
        if (safeNum(cur.CAGR) < neighCAGR - 0.01)
            compRecs.push(`Tu CAGR (${toFixedNum(safeNum(cur.CAGR) * 100, 2)}%) está por debajo del grupo similar (${toFixedNum(neighCAGR * 100, 2)}%). Ajusta horizontes o frecuencia operativa.`);
        if (compRecs.length === 0)
            compRecs.push("Perfil competitivo frente a vecinos históricos. Estrategia estable y bien calibrada.");
    }
    // --- Resultado final ---
    const summary = `Tutor Adaptativo Unificado Omega Learn v7.1 (Hybrid Advisor Premium)`;
    return {
        summary,
        mode: statsSrc,
        stats: {
            meanSharpe,
            meanMDD,
            meanCAGR,
            meanEquity,
            robustnessScore,
            quantGrade,
        },
        sources: {
            datasetCount: ds.count,
            memoryCount: ms.count,
            weights: { dataset: toFixedNum(wDS, 3), memory: toFixedNum(wMS, 3) },
        },
        recommendations: [...baseRecs, ...compRecs],
    };
}
// ===============================================================
// 🧬 Omega Neural Advisor v9 – Synaptic Intelligence Core
// ===============================================================
export function generateUnifiedAdviceHybridV9(strategyId, mode = "neural") {
    const datasetRecs = loadDatasetRecords();
    const memoryRecs = loadMemoryRecords();
    // --- 🔢 Estadísticas básicas ---
    const ds = {
        meanSharpe: mean(datasetRecs.map((r) => safeNum(r.Sharpe))),
        meanMDD: mean(datasetRecs.map((r) => safeNum(r.MaxDD))),
        meanCAGR: mean(datasetRecs.map((r) => safeNum(r.CAGR))),
    };
    const ms = {
        meanSharpe: mean(memoryRecs.map((r) => safeNum(r.Sharpe))),
        meanMDD: mean(memoryRecs.map((r) => safeNum(r.MaxDD))),
        meanCAGR: mean(memoryRecs.map((r) => safeNum(r.CAGR))),
    };
    // --- 🧠 Capa Sináptica Inteligente ---
    const fusionWeight = (datasetRecs.length + memoryRecs.length) / 100;
    const synapticSharpe = toFixedNum((ds.meanSharpe * 0.6 + ms.meanSharpe * 0.4) * (1 + fusionWeight * 0.05), 6);
    const synapticMDD = toFixedNum((ds.meanMDD * 0.4 + ms.meanMDD * 0.6) * (1 - fusionWeight * 0.03), 6);
    const synapticCAGR = toFixedNum((ds.meanCAGR * 0.5 + ms.meanCAGR * 0.5) * (1 + fusionWeight * 0.07), 6);
    // --- 🧩 Índices Cognitivos ---
    const cognitiveStability = toFixedNum(1 / (1 + Math.abs(synapticMDD)), 3);
    const synapticConsistency = toFixedNum((synapticSharpe * 1.5 + synapticCAGR * 100) * cognitiveStability, 3);
    const quantGrade = computeQuantGrade(synapticConsistency / 1.2);
    // --- 🧠 Insights dinámicos del modo neural ---
    const neuralInsights = [];
    if (synapticSharpe > 1)
        neuralInsights.push("Modelo muestra consistencia de retorno superior a la media histórica.");
    if (synapticCAGR > 0.05)
        neuralInsights.push("Tendencia de crecimiento estable detectada en el plano sináptico.");
    if (synapticMDD < -0.1)
        neuralInsights.push("Detectado nivel de riesgo elevado, ajustar exposición o tamaño de posición.");
    if (neuralInsights.length === 0)
        neuralInsights.push("Sinápsis estable. Modo cognitivo en equilibrio.");
    // --- 🧩 Recomendaciones combinadas (v7.1 + Neural) ---
    const hybridBase = generateUnifiedAdviceHybrid(strategyId, "hybrid");
    const finalRecs = [...(hybridBase.recommendations ?? []), ...neuralInsights];
    // --- 📊 Resultado final ---
    return {
        summary: "Omega Neural Advisor v9 – Synaptic Intelligence Core",
        mode,
        stats: {
            meanSharpe: synapticSharpe,
            meanMDD: synapticMDD,
            meanCAGR: synapticCAGR,
            cognitiveStability,
            synapticConsistency,
            quantGrade,
        },
        fusion: {
            dataset: datasetRecs.length,
            memory: memoryRecs.length,
            fusionWeight: toFixedNum(fusionWeight, 3),
        },
        recommendations: finalRecs,
    };
}
// ===============================================================
// 🫂 Omega Symbiont Advisor v10 — Personal Neural Twin (User Brainprint)
// ===============================================================
// Funde Synaptic (v9) + Brainprint personal para ajustar a tu forma de operar.
export function generateUnifiedAdviceHybridV10(strategyId) {
    // Base v9
    const syn = generateUnifiedAdviceHybridV9(strategyId, "neural");
    const bp = loadBrainprint(strategyId);
    // Si no hay brainprint, devolvemos v9 “tal cual” pero con sello v10.
    if (!bp) {
        return {
            ...syn,
            summary: "Omega Symbiont Advisor v10 — Personal Neural Twin",
            note: "No se detectó User Brainprint; se usó núcleo Synaptic v9.",
        };
    }
    // Ajustes personales (ligeros y estables)
    const rpWeight = bp.riskProfile === "BAJO" ? 0.9 : bp.riskProfile === "ALTO" ? 1.1 : 1.0;
    const stats = syn.stats;
    const meanSharpe = safeNum(stats.meanSharpe);
    const meanMDD = safeNum(stats.meanMDD);
    const meanCAGR = safeNum(stats.meanCAGR);
    // Si el usuario tiene stats propios, hacemos un blend suave
    const uSharpe = safeNum(bp.stats?.sharpe, meanSharpe);
    const uMDD = safeNum(bp.stats?.mdd, meanMDD);
    const uCAGR = safeNum(bp.stats?.cagr, meanCAGR);
    // Mezcla: 70% synaptic + 30% user (y escala por perfil de riesgo)
    const symSharpe = toFixedNum((meanSharpe * 0.7 + uSharpe * 0.3) * rpWeight, 6);
    const symMDD = toFixedNum((meanMDD * 0.7 + uMDD * 0.3) * (2 - rpWeight), 6);
    const symCAGR = toFixedNum((meanCAGR * 0.7 + uCAGR * 0.3) * rpWeight, 6);
    const cognitiveStability = toFixedNum(1 / (1 + Math.abs(symMDD)), 3);
    const symbiontScore = toFixedNum((symSharpe * 1.5 + symCAGR * 100) * cognitiveStability, 3);
    const quantGrade = computeQuantGrade(symbiontScore / 1.2);
    // Insights personalizados
    const insights = [];
    if (bp.habits?.length)
        insights.push(`Se detectaron hábitos del operador: ${bp.habits.join(", ")}`);
    if (bp.labels?.length)
        insights.push(`Etiquetas cognitivas activas: ${bp.labels.join(", ")}`);
    if (bp.riskProfile)
        insights.push(`Perfil de riesgo: ${bp.riskProfile}`);
    if (symSharpe < meanSharpe)
        insights.push("Afinar reglas de salida acorde a tu sesgo de ejecución.");
    if (Math.abs(symMDD) > Math.abs(meanMDD))
        insights.push("Riesgo personal elevado: considera límites operativos y stops escalonados.");
    // Recombinamos recomendaciones: v9 + personales
    const recs = [
        ...(syn.recommendations ?? []),
        "Ajusta tamaño de posición dinámico según perfil de riesgo personal.",
        "Revisa consistencia en horarios/activos donde tu brainprint rinde mejor.",
    ];
    return {
        summary: "Omega Symbiont Advisor v10 — Personal Neural Twin",
        mode: "symbiont",
        stats: {
            meanSharpe: symSharpe,
            meanMDD: symMDD,
            meanCAGR: symCAGR,
            cognitiveStability,
            symbiontScore,
            quantGrade,
        },
        brainprint: {
            hasBrainprint: true,
            riskProfile: bp.riskProfile ?? "N/A",
            habits: bp.habits ?? [],
            labels: bp.labels ?? [],
            timestamp: bp.timestamp,
        },
        insights: [...(syn.insights ?? []), ...insights],
        recommendations: recs,
    };
}

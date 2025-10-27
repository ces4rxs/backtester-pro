// src/server_ai.ts — 🧠 Omega AI Server v4.3.2 FINAL
// Stable + Tutor Unificado v7.1 (Hybrid) + Neural v8/v9 (Synaptic) + v10 (Symbiont) + Predict + Memory Learn
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { appendSample, loadMemory, ensureMemory } from "./learn/memoryStore.js";
import { generateAdvice } from "./learn/learner.js";
import { generateUnifiedAdviceHybrid, // v7.1 Hybrid Advisor Premium
generateUnifiedAdviceHybridV9, // v9 Synaptic Intelligence Core
generateUnifiedAdviceHybridV10, // v10 Symbiont (Personal Neural Twin)
 } from "./ai/hybridAdvisor.js";
import { saveBrainprint } from "./ai/userBrainprint.js"; // v10 Brainprint
const app = express();
app.use(cors());
app.use(bodyParser.json());
// 📂 /reports
const REPORTS_DIR = path.join(process.cwd(), "reports");
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    console.log("📁 Carpeta /reports creada automáticamente");
}
ensureMemory();
// 🧠 LOG bonito
app.use((req, _res, next) => {
    const now = new Date().toLocaleTimeString("es-CO", { hour12: false });
    const color = (t, c) => `\x1b[${c}m${t}\x1b[0m`;
    console.log(`${color("📡 [OMEGA-REQ]", "36")} ${color(req.method, "33")} ${req.path}  ⏱️ ${now}`);
    next();
});
// ✅ Base
app.get("/", (_req, res) => res.send("🚀 Omega AI Server operativo v4.3.2 (v7.1 + v8 + v9 Synaptic + v10 Symbiont + Brainprint)"));
// =====================================================
// 1) /ai/manifest
// =====================================================
app.get("/ai/manifest", (_req, res) => {
    const manifest = {
        runId: "omega-1761247118173",
        timestamp: new Date().toISOString(),
        engineVersion: "v3.18",
        strategy: "UnnamedStrategy",
        seed: "1761247118173",
        options: { validateData: true },
        data: {
            bars: 2400,
            start: Date.now() - 86400000 * 100,
            end: Date.now(),
            checksum: "a9443b3b9b23026b5d4757ff4b2265c49ed7c25fb4759d8a0af33dcb06c14",
        },
        metrics: {
            equityFinal: 10546.83695,
            netReturnTotal: 0.054638695,
            cagr: 0.057244219786757,
            sharpe: 1.22926692667375,
            mdd: -0.021196536872177,
            tradesCount: 15,
        },
    };
    res.json({
        lastUpdated: manifest.timestamp,
        strategies: [
            {
                id: "demo-unnamed",
                name: manifest.strategy,
                sharpe: manifest.metrics.sharpe,
                quantumRating: 7.45,
                robustnessProb: 83.2,
                overfitRisk: "MEDIO",
                tutor: "Esta estrategia presenta robustez moderada. Considera validar en diferentes activos o ajustar el horizonte temporal.",
                checksum: manifest.data.checksum,
                createdAt: manifest.timestamp,
            },
        ],
        integrity: { match: true, score: 1.0 },
    });
});
// =====================================================
// 2) Crear reporte público
// =====================================================
app.post("/ai/reports", (req, res) => {
    const { strategyId } = req.body || {};
    const id = strategyId || "demo-unnamed";
    const reportData = {
        reportId: id,
        quantumRating: 7.45,
        overfitRisk: "MEDIO",
        robustness: "83.2%",
        integrity: true,
        date: new Date().toISOString(),
        url: `http://192.168.1.90:4000/reports/${id}.json`,
    };
    const filePath = path.join(REPORTS_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
    console.log(`📘 [REPORT] Guardado: ${filePath}`);
    res.json({ success: true, message: "Reporte público generado y guardado correctamente", publicUrl: reportData.url });
});
// =====================================================
// 3) Obtener reporte
// =====================================================
app.get("/ai/report/:id", (req, res) => {
    const { id } = req.params;
    const filePath = path.join(REPORTS_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        console.log(`📊 [REPORT-GET] Enviado reporte IA: ${id}`);
        return res.json(data);
    }
    console.warn(`⚠️ [REPORT-GET] No se encontró el reporte: ${id}`);
    res.status(404).json({ error: "Reporte no encontrado" });
});
// =====================================================
// 4) Tutor IA básico
// =====================================================
app.get("/ai/learn/:id", (req, res) => {
    const { id } = req.params;
    console.log(`🎓 [LEARN] Tutor IA consultado para estrategia: ${id}`);
    const tutorResponse = {
        strategyId: id,
        message: "🧠 Esta estrategia parece tener un comportamiento estable en el corto plazo. " +
            "Podrías mejorar su robustez aplicando validación cruzada y filtros de volatilidad.",
        recommendations: [
            "Usar Monte Carlo simple para medir sensibilidad a ruido.",
            "Analizar CVaR (Conditional Value at Risk) para cuantificar pérdidas extremas.",
            "Implementar un filtro adaptativo SMA dinámico según volatilidad reciente.",
        ],
    };
    res.json(tutorResponse);
});
// =====================================================
// 5) Guardar experiencia (Memory Learn)
// =====================================================
app.post("/ai/learn/update", (req, res) => {
    const body = req.body || {};
    const sample = {
        strategyId: String(body.strategyId || "unknown"),
        sharpe: isFinite(body.sharpe) ? Number(body.sharpe) : undefined,
        mdd: isFinite(body.mdd) ? Number(body.mdd) : undefined,
        cvar: isFinite(body.cvar) ? Number(body.cvar) : undefined,
        quantumRating: isFinite(body.quantumRating) ? Number(body.quantumRating) : undefined,
        overfitRisk: ["BAJO", "MEDIO", "ALTO"].includes(body.overfitRisk) ? body.overfitRisk : undefined,
        robustnessProb: isFinite(body.robustnessProb) ? Number(body.robustnessProb) : undefined,
        labels: Array.isArray(body.labels) ? body.labels.slice(0, 8) : undefined,
        timestamp: new Date().toISOString(),
    };
    const mem = appendSample(sample);
    console.log(`🧠 [LEARN-UPDATE] Guardado sample de ${sample.strategyId}. Total: ${mem.stats.count}`);
    res.json({ ok: true, stats: mem.stats });
});
// =====================================================
// 6) Ver memoria completa
// =====================================================
app.get("/ai/learn/memory", (_req, res) => res.json(loadMemory()));
// =====================================================
// 7) Consejos personalizados (memoria + reglas)
// =====================================================
app.get("/ai/learn/advice/:id", (req, res) => {
    const id = req.params.id;
    const current = { strategyId: id, quantumRating: 7.45, overfitRisk: "MEDIO", robustnessProb: 83.2 };
    const mem = loadMemory();
    const advice = generateAdvice(current, mem);
    res.json({ strategyId: id, current, memoryStats: mem.stats, advice });
});
// =====================================================
// 8) Tutor Unificado v7.1 (Hybrid Advisor Premium)
// =====================================================
app.get("/ai/learn/unified/:id", (req, res) => {
    const { id } = req.params;
    const modeParam = String(req.query.mode || "hybrid");
    console.log(`🧠 [UNIFIED v7.1] Tutor adaptativo solicitado para ${id} (modo=${modeParam})`);
    try {
        const result = generateUnifiedAdviceHybrid(id, modeParam);
        console.log("✅ [UNIFIED v7.1] Ejecutado correctamente.");
        res.json({ ok: true, strategyId: id, result });
    }
    catch (err) {
        console.error("❌ [UNIFIED v7.1] Error:", err?.message || err);
        res.status(500).json({ ok: false, error: err?.message || "unknown" });
    }
});
// =====================================================
// 9) Predictor (Quantum+ Rating)
// =====================================================
app.get("/ai/predict/:strategyId", (req, res) => {
    const { strategyId } = req.params;
    try {
        const resultsDir = path.join(process.cwd(), "results");
        if (!fs.existsSync(resultsDir)) {
            return res.status(404).json({ ok: false, message: "❌ No existe carpeta results/" });
        }
        const folders = fs
            .readdirSync(resultsDir)
            .filter((f) => fs.statSync(path.join(resultsDir, f)).isDirectory())
            .sort((a, b) => fs.statSync(path.join(resultsDir, b)).mtimeMs - fs.statSync(path.join(resultsDir, a)).mtimeMs);
        if (!folders.length) {
            return res.status(404).json({ ok: false, message: "⚠️ No hay resultados recientes en /results" });
        }
        const latest = folders[0];
        const manifestPath = path.join(resultsDir, latest, "manifest.json");
        if (!fs.existsSync(manifestPath)) {
            return res.status(404).json({ ok: false, message: "⚠️ No se encontró manifest.json" });
        }
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
        const { sharpe = 0, mdd = 0, cagr = 0, tradesCount = 0 } = manifest.metrics || {};
        const sharpeNorm = Math.min(Math.max(sharpe / 3, 0), 1);
        const mddPenalty = Math.min(Math.abs(mdd) / 0.5, 1);
        const cagrNorm = Math.min(Math.max(cagr / 0.2, 0), 1);
        const tradesNorm = Math.min(tradesCount / 100, 1);
        const robustnessScore = 0.45 * sharpeNorm + 0.25 * (1 - mddPenalty) + 0.2 * cagrNorm + 0.1 * tradesNorm;
        const predictedRating = Number((robustnessScore * 100).toFixed(2));
        const confidenceLevel = Math.min(0.6 + robustnessScore * 0.4, 1);
        const rationale = predictedRating > 80
            ? "Estrategia altamente robusta según métricas históricas."
            : predictedRating > 60
                ? "Estrategia aceptable, pero revisa drawdowns y consistencia."
                : "Estrategia débil, posible sobreajuste detectado.";
        res.json({ ok: true, strategyId, predictedRating, confidenceLevel, rationale });
    }
    catch (err) {
        console.error("❌ Error en predictor:", err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});
// =====================================================
// 10) Neural Advisor v8 / v9 (Synaptic)
//      - /ai/learn/neural/:id?v=8  -> v8 (default)
//      - /ai/learn/neural/:id?v=9  -> v9
// =====================================================
function readDatasetSafe() {
    try {
        const datasetPath = path.join(process.cwd(), "src", "ai", "datasets", "dataset.json");
        if (!fs.existsSync(datasetPath))
            return null;
        return JSON.parse(fs.readFileSync(datasetPath, "utf8"));
    }
    catch {
        return null;
    }
}
app.get("/ai/learn/neural/:id", (req, res) => {
    const { id } = req.params;
    const version = String(req.query.v || "8"); // "8" | "9"
    if (version === "9") {
        try {
            console.log(`🧬 [NEURAL v9] Analizando estrategia: ${id} (Synaptic)`);
            const result = generateUnifiedAdviceHybridV9(id, "neural");
            console.log("✅ [NEURAL v9] Evaluación completada.");
            return res.json({ ok: true, strategyId: id, mode: "neural", result });
        }
        catch (err) {
            console.error("❌ [NEURAL v9] Error:", err?.message || err);
            return res.status(500).json({ ok: false, error: err?.message || "unknown" });
        }
    }
    // —— v8: Cognitive Pattern Engine
    console.log(`🧬 [NEURAL v8] Analizando estrategia: ${id}`);
    try {
        const mem = loadMemory();
        const dataset = readDatasetSafe() || {};
        const last = mem.samples[mem.samples.length - 1] || {};
        const sharpe = Number(dataset.Sharpe ?? last.sharpe ?? 0);
        const mdd = Number(dataset.MaxDD ?? last.mdd ?? 0);
        const cagr = Number(dataset.CAGR ?? last.cvar ?? 0);
        const equity = Number(dataset.EquityFinal ?? 0);
        const volatility = Math.abs(mdd);
        const riskFactor = Math.max(0.2, 1 - volatility * 3);
        const performance = sharpe * 1.5 + cagr * 100;
        const neuralScore = Math.min(performance * riskFactor, 10);
        const neuralScoreStr = neuralScore.toFixed(2);
        let cognitiveGrade = "C";
        if (neuralScore >= 9)
            cognitiveGrade = "A+";
        else if (neuralScore >= 8)
            cognitiveGrade = "A";
        else if (neuralScore >= 6)
            cognitiveGrade = "B";
        else if (neuralScore >= 4)
            cognitiveGrade = "C";
        else
            cognitiveGrade = "D";
        const archetypes = ["Momentum Learner", "Mean Reverter", "Volatility Seeker", "Entropy Balancer", "Adaptive Survivor"];
        const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
        const result = {
            summary: "Omega Neural Advisor v8 — Cognitive Pattern Engine",
            stats: {
                meanSharpe: sharpe.toFixed(3),
                meanMDD: mdd.toFixed(3),
                meanCAGR: cagr.toFixed(3),
                meanEquity: equity.toFixed(2),
                neuralScore: neuralScoreStr,
                cognitiveGrade,
                archetype,
            },
            insights: [
                "Analiza correlaciones entre estrategias con Sharpe similar.",
                "Evalúa robustez bajo condiciones de mercado volátiles.",
                "Entrena variaciones para reforzar adaptabilidad del modelo.",
            ],
        };
        console.log(`✅ [NEURAL v8] Evaluación completada (${cognitiveGrade}, ${archetype})`);
        res.json({ ok: true, strategyId: id, mode: "neural", result });
    }
    catch (err) {
        console.error("❌ [NEURAL v8] Error:", err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});
// =====================================================
// 🔗 Fallback limpio para /ai/learn/synaptic/:id (evita 404)
// =====================================================
app.get("/ai/learn/synaptic/:id", (req, res) => {
    const { id } = req.params;
    console.log(`🧬 [FALLBACK] Tutor Synaptic solicitado para ${id}`);
    try {
        const result = generateUnifiedAdviceHybridV9(id, "neural");
        res.json({ ok: true, strategyId: id, mode: "synaptic", result });
    }
    catch (err) {
        console.error("❌ [FALLBACK Synaptic] Error:", err?.message || err);
        res.status(500).json({ ok: false, error: err?.message || "unknown" });
    }
});
// =====================================================
// 11) Guardar User Brainprint (v10)
// =====================================================
app.post("/ai/brainprint", (req, res) => {
    try {
        const payload = req.body || {};
        if (!payload.strategyId) {
            return res.status(400).json({ ok: false, error: "strategyId es requerido" });
        }
        const saved = saveBrainprint({
            strategyId: String(payload.strategyId),
            stats: payload.stats,
            riskProfile: payload.riskProfile,
            habits: payload.habits,
            labels: payload.labels,
            notes: payload.notes,
        });
        console.log(`🫂 [BRAINPRINT] Guardado para ${saved.strategyId}`);
        res.json({ ok: true, saved });
    }
    catch (err) {
        console.error("❌ [BRAINPRINT] Error:", err?.message || err);
        res.status(500).json({ ok: false, error: err?.message || "unknown" });
    }
});
// =====================================================
// 12) Symbiont Advisor (v10 – Personal Neural Twin)
// =====================================================
app.get("/ai/learn/symbiont/:id", (req, res) => {
    const { id } = req.params;
    try {
        console.log(`🫂 [SYM-BRAIN] Analizando estrategia: ${id}`);
        const result = generateUnifiedAdviceHybridV10(id);
        console.log("✅ [SYM-BRAIN] v10 completado correctamente.");
        res.json({ ok: true, strategyId: id, mode: "symbiont", result });
    }
    catch (err) {
        console.error("❌ [SYM-BRAIN] Error:", err?.message || err);
        res.status(500).json({ ok: false, error: err?.message || "unknown" });
    }
});
// Alias opcional para v10
app.get("/ai/learn/neuralv10/:id", (req, res) => {
    const { id } = req.params;
    try {
        const result = generateUnifiedAdviceHybridV10(id);
        res.json({ ok: true, strategyId: id, mode: "symbiont", result });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err?.message || "unknown" });
    }
});
// =====================================================
// 13) Predictor Avanzado (v4.4 ML + features)
// =====================================================
import { predictForCurrent } from "./ai/predictor.js";
import { runMonteCarlo } from "./ai/montecarlo.js";
app.get("/ai/predict/advanced/:strategyId?", (_req, res) => {
    try {
        const pred = predictForCurrent(); // usa el último manifest como estado base
        return res.json({
            ok: true,
            ...pred,
            note: "CORE v4.4 ML predictor",
        });
    }
    catch (e) {
        console.error("❌ /ai/predict/advanced error:", e?.message || e);
        res.status(500).json({ ok: false, error: e?.message || "unknown" });
    }
});
// =====================================================
// 14) Monte Carlo (v4.4) — distribución esperada
// =====================================================
app.get("/ai/montecarlo/:strategyId?", (req, res) => {
    try {
        const runs = Math.max(100, Math.min(1000, Number(req.query.runs) || 300));
        const mc = runMonteCarlo(runs);
        return res.json({ ok: true, ...mc, note: "CORE v4.4 Monte Carlo" });
    }
    catch (e) {
        console.error("❌ /ai/montecarlo error:", e?.message || e);
        res.status(500).json({ ok: false, error: e?.message || "unknown" });
    }
});
// 🚀 SERVIDOR
const PORT = 4000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`💡 Omega AI Server v4.3.2 corriendo en http://192.168.1.90:${PORT}`);
    console.log("📡 Módulos activos: v7.1, v8, v9 (Synaptic), v10 (Symbiont + Brainprint)");
});

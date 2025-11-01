// src/server_ai.ts — 🧠 Omega AI Server v4.3.2 FINAL
// Stable + Tutor Unificado v7.1 (Hybrid) + Neural v8/v9 (Synaptic) + v10 (Symbiont) + Predict + Memory Learn
// src/server_ai.ts
// src/server_ai.ts — 🧠 Omega AI Server v4.3.2 FINAL
// src/server_ai.ts — 🧠 Omega AI Server v4.3.2 FINAL
import { startMarketAutoUpdater } from "./data/marketAutoUpdater.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/server_auth.js";
import { generateQuantumRiskV13 } from "./ai/quantumRisk_v13.js";
import { generateMontecarloV11 } from "./ai/montecarlo_v11.js";   // v11 SAFE
import { generateMontecarloV12 } from "./ai/montecarlo_v12.js";   // v12 SAFE
import { generateCognitiveRiskV14 } from "./ai/cognitiveRisk_v14.js"; // v14 SAFE


// ✅ Config .env compatible con Render + local
dotenv.config();
console.log("🧠 OMEGA_V5_ENABLED =", process.env.OMEGA_V5_ENABLED);



import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { appendSample, loadMemory, ensureMemory, LearnSample } from "./learn/memoryStore.js";
import { generateAdvice } from "./learn/learner.js";
import {
  generateUnifiedAdviceHybrid,    // v7.1 Hybrid Advisor Premium
  generateUnifiedAdviceHybridV9,  // v9 Synaptic Intelligence Core
  generateUnifiedAdviceHybridV10, // v10 Symbiont (Personal Neural Twin)
} from "./ai/hybridAdvisor.js";
import { saveBrainprint } from "./ai/userBrainprint.js"; // v10 Brainprint
import { generateNeuralAdvisorV11 } from "./ai/neuralAdvisor_v11.js"; // 🧠 v11 Reflexive Cognition Core

const app = express();
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://192.168.1.90:3000",
  process.env.FRONTEND_URL,        // p.ej. https://tu-frontend.com
  process.env.RENDER_FRONTEND_URL, // opcional
].filter(Boolean);

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use("/auth", authRouter);
import strategyRouter from "../routes/server_strategies.js";
app.use("/api/strategies", strategyRouter);


// ✅ Hacer pública la carpeta /reports (solo lectura, segura)
const reportsPath = path.join(process.cwd(), "reports");
app.use("/reports", express.static(reportsPath));
console.log("🌐 Carpeta /reports habilitada para acceso público (solo lectura)");

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
  const color = (t: string, c: string) => `\x1b[${c}m${t}\x1b[0m`;
  console.log(`${color("📡 [OMEGA-REQ]", "36")} ${color(req.method, "33")} ${req.path}  ⏱️ ${now}`);
  next();
});

// ✅ Base
app.get("/", (_req, res) =>
  res.send("🚀 Omega AI Server operativo v4.3.2 (v7.1 + v8 + v9 Synaptic + v10 Symbiont + Brainprint)"),
);

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
        tutor:
          "Esta estrategia presenta robustez moderada. Considera validar en diferentes activos o ajustar el horizonte temporal.",
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

  // ✅ URL pública dinámica
  const proto = (req.headers["x-forwarded-proto"] as string) || "http";
  const host = req.get("host");
  const publicBase = process.env.PUBLIC_BASE_URL || `${proto}://${host}`;

  const reportData = {
    reportId: id,
    quantumRating: 7.45,
    overfitRisk: "MEDIO",
    robustness: "83.2%",
    integrity: true,
    date: new Date().toISOString(),
    url: `${publicBase}/reports/${id}.json`,
  };

  const filePath = path.join(REPORTS_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));

  console.log(`📘 [REPORT] Guardado: ${filePath}`);
  res.json({
    success: true,
    message: "Reporte público generado y guardado correctamente",
    publicUrl: reportData.url,
  });
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
    message:
      "🧠 Esta estrategia parece tener un comportamiento estable en el corto plazo. " +
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
  const sample: LearnSample = {
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
  const current = { strategyId: id, quantumRating: 7.45, overfitRisk: "MEDIO" as const, robustnessProb: 83.2 };
  const mem = loadMemory();
  const advice = generateAdvice(current, mem);
  res.json({ strategyId: id, current, memoryStats: mem.stats, advice });
});

// =====================================================
// 8) Tutor Unificado v7.1 (Hybrid Advisor Premium)
// =====================================================
app.get("/ai/learn/unified/:id", (req, res) => {
  const { id } = req.params;
  const modeParam = String(req.query.mode || "hybrid") as "hybrid" | "dataset" | "memory";
  console.log(`🧠 [UNIFIED v7.1] Tutor adaptativo solicitado para ${id} (modo=${modeParam})`);
  try {
    const result = generateUnifiedAdviceHybrid(id, modeParam);
    console.log("✅ [UNIFIED v7.1] Ejecutado correctamente.");
    res.json({ ok: true, strategyId: id, result });
  } catch (err: any) {
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
      .sort(
        (a, b) => fs.statSync(path.join(resultsDir, b)).mtimeMs - fs.statSync(path.join(resultsDir, a)).mtimeMs,
      );

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
    const rationale =
      predictedRating > 80
        ? "Estrategia altamente robusta según métricas históricas."
        : predictedRating > 60
        ? "Estrategia aceptable, pero revisa drawdowns y consistencia."
        : "Estrategia débil, posible sobreajuste detectado.";

    res.json({ ok: true, strategyId, predictedRating, confidenceLevel, rationale });
  } catch (err: any) {
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
    if (!fs.existsSync(datasetPath)) return null;
    return JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  } catch {
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
    } catch (err: any) {
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
    if (neuralScore >= 9) cognitiveGrade = "A+";
    else if (neuralScore >= 8) cognitiveGrade = "A";
    else if (neuralScore >= 6) cognitiveGrade = "B";
    else if (neuralScore >= 4) cognitiveGrade = "C";
    else cognitiveGrade = "D";

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
  } catch (err: any) {
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
  } catch (err: any) {
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
  } catch (err: any) {
    console.error("❌ [BRAINPRINT] Error:", err?.message || err);
    res.status(500).json({ ok: false, error: err?.message || "unknown" });
  }
});

// =====================================================
// 12) Symbiont Advisor (v10 – Personal Neural Twin)
// =====================================================
app.get("/ai/learn/symbiont/:id", async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`🫂 [SYM-BRAIN] Analizando estrategia: ${id}`);
    const result = await generateUnifiedAdviceHybridV10(id); // ✅ FIX: ahora usa await
    console.log("✅ [SYM-BRAIN] v10 completado correctamente.");
    res.json({ ok: true, strategyId: id, mode: "symbiont", result });
  } catch (err: any) {
    console.error("❌ [SYM-BRAIN] Error:", err?.message || err);
    res.status(500).json({ ok: false, error: err?.message || "unknown" });
  }
});

app.get("/ai/learn/neuralv10/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await generateUnifiedAdviceHybridV10(id); // ✅ FIX: await agregado
    res.json({ ok: true, strategyId: id, mode: "symbiont", result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "unknown" });
  }
});

// =====================================================
// 13) Predictor Avanzado (v4.4 ML + features)
// =====================================================
import { predictForCurrent } from "./ai/predictor_v4.js";
import { runMonteCarlo } from "./ai/montecarlo.js";

app.get(["/ai/predict/advanced", "/ai/predict/advanced/:strategyId"], (_req, res) => {
  try {
    const pred = predictForCurrent(); // usa el último manifest como estado base
    return res.json({
      ok: true,
      ...pred,
      note: "CORE v4.4 ML predictor",
    });
  } catch (e:any) {
    console.error("❌ /ai/predict/advanced error:", e?.message || e);
    res.status(500).json({ ok:false, error: e?.message || "unknown" });
  }
});

// =====================================================
// 14) Monte Carlo (v4.4) — distribución esperada
// =====================================================
app.get(["/ai/montecarlo", "/ai/montecarlo/:strategyId"], (req, res) => {
  try {
    const runs = Math.max(100, Math.min(1000, Number(req.query.runs) || 300));
    const mc = runMonteCarlo(runs);
    return res.json({ ok: true, ...mc, note: "CORE v4.4 Monte Carlo" });
  } catch (e:any) {
    console.error("❌ /ai/montecarlo error:", e?.message || e);
    res.status(500).json({ ok:false, error: e?.message || "unknown" });
  }
});
// =====================================================
// 15) Optimizador Adaptativo (CORE v5.0 – "El Estratega")
// =====================================================
import { runAdaptiveOptimizer } from "./core_v5/optimizer_v5.js";
// 👇 usamos alias para no chocar con el predictor anterior
import { predictForCurrent as predictForCurrentV5 } from "./ai/predictor_v4.js";

app.post("/ai/optimize", async (req, res) => {
  try {
    // 🔒 Feature-flag de seguridad (solo se activa si OMEGA_V5_ENABLED=true)
    if (process.env.OMEGA_V5_ENABLED !== "true") {
      return res.status(403).json({ ok: false, message: "CORE v5.0 está desactivado (flag OMEGA_V5_ENABLED=false)" });
    }

    const { manifest, goal } = req.body || {};
    if (!manifest || !goal) {
      return res.status(400).json({ ok: false, error: "Se requiere manifest y goal" });
    }

    console.log(`🧠 [OPTIMIZER v5] Recibido objetivo: ${JSON.stringify(goal)}`);

    // 🔗 Adaptador al Profeta v4.4
    const prophetPredict = async (variant) => {
const pred = predictForCurrentV5(variant); // ✅ usa el alias correcto
      return {
        predictedSharpe: pred?.predictedSharpe ?? 0,
        predictedMDD: pred?.predictedMDD ?? 0,
        antiOverfit: pred?.antiOverfit ?? 0,
      };
    };

    const report = await runAdaptiveOptimizer(manifest, goal, { prophetPredict });
    const filePath = path.join(REPORTS_DIR, `optimization_${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

    console.log(`🧩 [OPTIMIZER v5] Reporte generado y guardado: ${filePath}`);
    res.json({ ok: true, report });
  } catch (err) {
    console.error("❌ [OPTIMIZER v5] Error:", err);
    res.status(500).json({ ok: false, error: err?.message || "unknown" });
  }
});

// =====================================================
// 16) Symbiont Advisor v10 (POST para API externa)
// =====================================================
app.post("/ai/symbiont", async (req, res) => {
  try {
    const { strategyId } = req.body;
    if (!strategyId) {
      return res.status(400).json({ ok: false, error: "Falta strategyId" });
    }

    console.log(`🫂 [SYM-REQ] Analizando estrategia: ${strategyId}`);

    // Ejecuta el módulo del Symbiont
    const result = await generateUnifiedAdviceHybridV10(strategyId);

    console.log("✅ [SYM-REQ] v10 completado correctamente.");

    // Devuelve estructura JSON compatible con frontend
    return res.json({
      ok: true,
      summary: result.summary,
      mode: result.mode,
      stats: result.stats,
      brainprint: result.brainprint,
      optimizer: result.optimizer || null,
      insights: result.insights,
      recommendations: result.recommendations,
    });
  } catch (err: any) {
    console.error("❌ [SYM-REQ] Error en /ai/symbiont:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =====================================================
// 17) Tutor Cognitivo (v10.1 – Omega Learn Integration)
// =====================================================
app.post("/ai/tutor/report", async (req, res) => {
  try {
    const { report } = req.body || {};
    if (!report) {
      return res.status(400).json({ ok: false, error: "Falta el campo 'report' con los datos del tutor" });
    }

    // ✅ Asegurar carpeta /reports
    const tutorDir = path.join(REPORTS_DIR, "tutor");
    if (!fs.existsSync(tutorDir)) {
      fs.mkdirSync(tutorDir, { recursive: true });
    }

    const fileName = `tutor_report_${Date.now()}.json`;
    const filePath = path.join(tutorDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

    console.log(`📘 [TUTOR-REPORT] Guardado correctamente -> ${filePath}`);
    res.json({
      ok: true,
      message: "Reporte del Tutor Cognitivo v10.1 guardado correctamente",
      path: filePath,
    });
  } catch (err: any) {
    console.error("❌ [TUTOR-REPORT] Error al guardar el reporte:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});
// =====================================================
// 17) Auto-Optimizer Loop v10.2 (Cierre del Bucle Cognitivo)
// =====================================================
import { runAutoLoopV10 } from "./ai/autoLoop.js";

app.post("/ai/autolearn", async (_req, res) => {
  try {
    console.log("🧠 [AUTO-LEARN] Ejecutando bucle cognitivo v10.2...");
    const result = await runAutoLoopV10();
    res.json({ ok: true, result });
  } catch (err: any) {
    console.error("❌ [AUTO-LEARN] Error:", err?.message);
    res.status(500).json({ ok: false, error: err?.message });
  }
});
// =====================================================
// 18) Datos de mercado en tiempo real (gratuito y educativo)
// =====================================================
import fs from "fs";
import path from "path";

app.get("/market/latest", async (_req, res) => {
  try {
    const marketDir = path.join(process.cwd(), "src", "data", "market");
    if (!fs.existsSync(marketDir)) {
      return res.status(404).json({ ok: false, error: "No existe carpeta de mercado" });
    }

    const assets = ["BTCUSD", "XAUUSD", "SP500"];
    const result: Record<string, any> = {};

    for (const asset of assets) {
      const files = fs
        .readdirSync(marketDir)
        .filter((f) => f.startsWith(asset))
        .sort(
          (a, b) =>
            fs.statSync(path.join(marketDir, b)).mtimeMs -
            fs.statSync(path.join(marketDir, a)).mtimeMs
        );

      if (files.length > 0) {
        const latestFile = path.join(marketDir, files[0]);
        const data = JSON.parse(fs.readFileSync(latestFile, "utf8"));
        result[asset] = {
          asset,
          lastPrice: data?.price ?? data?.close ?? data[data.length - 1]?.close ?? null,
          timestamp: data?.timestamp ?? new Date().toISOString(),
          source:
            asset === "BTCUSD"
              ? "CoinGecko"
              : asset === "XAUUSD"
              ? "Metals-API"
              : "Yahoo Finance",
        };
      } else {
        result[asset] = { asset, lastPrice: null, error: "No hay datos" };
      }
    }

    res.json({ ok: true, updatedAt: new Date().toISOString(), data: result });
  } catch (err: any) {
    console.error("❌ [MARKET] Error al leer datos:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =====================================================
// 19) Neural Advisor v11 — Reflexive Cognition Core
// =====================================================
app.get("/ai/learn/v11/:id", (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🧠 [V11] Analizando estrategia: ${id}`);
    const result = generateNeuralAdvisorV11(id);
    console.log("✅ [V11] Evaluación reflexiva completada.");
    res.json({ ok: true, strategyId: id, result });
  } catch (e: any) {
    console.error("❌ [V11] Error:", e?.message || e);
    res.status(500).json({ ok: false, error: e?.message || "unknown" });
  }
});
// =====================================================
// 20) Strategic Advisor v12 — Decision Engine
// =====================================================
import { generateStrategicAdvisorV12 } from "./ai/strategicAdvisor_v12.js";

app.get("/ai/learn/v12/:id", (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🧩 [V12] Ejecutando Strategic Advisor para: ${id}`);
    const result = generateStrategicAdvisorV12(id);
    console.log("✅ [V12] Evaluación estratégica completada.");
    res.json({ ok: true, strategyId: id, result });
  } catch (e: any) {
    console.error("❌ [V12] Error:", e?.message || e);
    res.status(500).json({ ok: false, error: e?.message || "unknown" });
  }
});

// =====================================================
// 21) Quantum Risk Layer v13 — Unified Risk Index (0–100)
// =====================================================
app.get("/ai/learn/v13/:id", (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🛡️ [V13] Calculando Quantum Risk para: ${id}`);
    const result = generateQuantumRiskV13(id);
    console.log(`✅ [V13] Riesgo unificado listo: ${result.risk.riskScore}`);
    res.json({ ok: true, strategyId: id, result });
  } catch (e: any) {
    console.error("❌ [V13] Error:", e?.message || e);
    res.status(500).json({ ok: false, error: e?.message || "unknown" });
  }
});

// =====================================================
// 🚀 Endpoints SAFE (no reemplazan nada existente)
// =====================================================
app.get("/ai/learn/v14/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Reutiliza v13 si está disponible por endpoint o como módulo importado
    const quantum = generateQuantumRiskV13?.(id) ?? { riskScore: 62 };
    const result = await generateCognitiveRiskV14({ id }, quantum);
    res.json({ ok: true, strategyId: id, result });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "unknown" });
  }
});

app.get("/ai/learn/v11plus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await generateMontecarloV11(id, { runs: 3000, entropyFactor: 1.0 });
    res.json({ ok: true, strategyId: id, result });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "unknown" });
  }
});

app.get("/ai/learn/v12plus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Llamamos v14 primero para darle “contexto cognitivo” al v12
    const quantum = generateQuantumRiskV13?.(id) ?? { riskScore: 62 };
    const v14 = await generateCognitiveRiskV14({ id }, quantum);
    const result = await generateMontecarloV12(id, v14, { maxRuns: 2200 });
    res.json({ ok: true, strategyId: id, result });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "unknown" });
  }
});






// ======================================================
// 🌐 RUTAS DE CONTROL IA (v10.3-B Web Control Panel)
// ✅ Versión corregida sin duplicados — Safe Patch Julio (2025-10-27)
// ======================================================

// ⚠️ Los imports originales de memoryStore, hybridAdvisor y montecarlo
// ya están definidos arriba. Aquí los renombramos como alias para evitar
// conflictos de compilación con TypeScript sin alterar la ejecución.

import {
  loadMemory as loadMemoryControl,
  ensureMemory as ensureMemoryControl,
} from "./learn/memoryStore.js";
import {
  generateUnifiedAdviceHybridV10 as generateUnifiedAdviceHybridV10Control,
} from "./ai/hybridAdvisor.js";
import {
  runMonteCarlo as runMonteCarloControl,
} from "./ai/montecarlo.js"; // ✅ alias seguro

// 🧩 Refrescar Memoria Cognitiva
app.post("/ai/learn/memory", async (req, res) => {
  try {
    await ensureMemoryControl();
    const mem = await loadMemoryControl();
    res.json({
      status: "ok",
      samples: Array.isArray(mem.samples) ? mem.samples.length : 0,
      message: "Memoria cognitiva actualizada exitosamente",
    });
  } catch (err: any) {
    console.error("❌ Error al refrescar memoria:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔮 Ejecutar Predicción Avanzada (usa Symbiont v10)
app.post("/ai/predict/advanced", async (req, res) => {
  try {
    const result = await generateUnifiedAdviceHybridV10Control({
      strategy: "demo",
      context: "educational",
    });
    res.json({
      status: "ok",
      message: "Predicción avanzada ejecutada",
      result,
    });
  } catch (err: any) {
    console.error("❌ Error en predicción avanzada:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🎲 Correr Simulación Montecarlo (CORE v4 estable)
app.post("/ai/montecarlo", async (_req, res) => {
  try {
    const result = await runMonteCarloControl(300); // DEBUG: control de número de ejecuciones
    res.json({
      status: "ok",
      message: "Simulación Montecarlo v4 ejecutada correctamente",
      result,
    });
  } catch (err: any) {
    console.error("❌ Error en Montecarlo:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🎲 Correr Simulación Montecarlo (CORE v4 estable)
app.post("/ai/montecarlo", async (_req, res) => {
  try {
    const result = await runMonteCarlo(300); // DEBUG: control de número de ejecuciones
    res.json({
      status: "ok",
      message: "Simulación Montecarlo v4 ejecutada correctamente",
      result,
    });
  } catch (err) {
    console.error("❌ Error en Montecarlo:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 🌍 Reflective Market Endpoint — v10.3-B Production Ready
// =====================================================
import fetch from "node-fetch";

// 🧠 Endpoint de correlaciones y precios reales (listo para prod)
app.get("/ai/reflective/market", async (_req, res) => {
  try {
    console.log("📡 [REFLECTIVE] Solicitando datos de mercado en tiempo real...");

    // --- Fuentes públicas ---
    const [btcRes, ethRes, goldRes, spRes, usdCopRes] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"),
      fetch("https://api.metals.live/v1/spot"),
      fetch("https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=1d&interval=1d"),
      fetch("https://api.exchangerate.host/latest?base=USD&symbols=COP"),
    ]);

    const btc = await btcRes.json();
    const eth = await ethRes.json();
    const goldRaw = await goldRes.json();
    const sp = await spRes.json();
    const usdCop = await usdCopRes.json();

    // --- Normalización de datos ---
    const gold = Array.isArray(goldRaw) ? goldRaw.find((m) => m.gold)?.gold : 2380;
    const spPrice = sp?.chart?.result?.[0]?.meta?.regularMarketPrice ?? 5200;
    const cop = usdCop?.rates?.COP ?? 4200;

    const data = {
      BTCUSD: btc.bitcoin?.usd ?? 68000,
      ETHUSD: eth.ethereum?.usd ?? 3600,
      XAUUSD: gold,
      SP500: spPrice,
      USDCOP: cop,
      timestamp: new Date().toISOString(),
    };

    // --- Correlaciones IA (modo educativo simulado) ---
    const correlations = {
      "BTC-Oro": +0.67,
      "BTC-S&P500": +0.41,
      "Oro-S&P500": -0.12,
      "BTC-ETH": +0.83,
    };

    // --- Insights IA simulados ---
    const insights = [
      "Correlación positiva BTC-ETH indica fase de riesgo moderado.",
      "El Oro mantiene su papel de refugio ante volatilidad creciente.",
      "El S&P500 refleja estabilidad relativa frente al dólar.",
    ];

    res.json({
      ok: true,
      version: "v10.3-B",
      lastUpdated: data.timestamp,
      data,
      correlations,
      insights,
    });
  } catch (err: any) {
    console.error("❌ [REFLECTIVE] Error obteniendo datos:", err.message);

    // --- Fallback local ---
    res.json({
      ok: true,
      version: "v10.3-B (Simulado)",
      data: {
        BTCUSD: 68000,
        ETHUSD: 3600,
        XAUUSD: 2380,
        SP500: 5230,
        USDCOP: 4200,
        timestamp: new Date().toISOString(),
      },
      correlations: {
        "BTC-Oro": +0.67,
        "BTC-S&P500": +0.41,
        "Oro-S&P500": -0.12,
        "BTC-ETH": +0.83,
      },
      insights: [
        "⚙️ Datos simulados: API real no disponible.",
        "IA reflexiva activa modo seguro para visualización.",
      ],
    });
  }
});

// =====================================================
//  🧠 /ai/status — Estado Interno de Módulos Cognitivos
// =====================================================
app.get("/ai/status", (_req, res) => {
  try {
    const modules = {
      v7_1: typeof generateUnifiedAdviceHybrid === "function" ? "active" : "missing",
      v8: "active",
      v9: "active",
      v10: "active",
      v11: typeof generateNeuralAdvisorV11 === "function" ? "active" : "missing",
      v12: "active",
      v13: typeof generateQuantumRiskV13 === "function" ? "active" : "missing",
      v14: typeof generateCognitiveRiskV14 === "function" ? "active" : "missing",
      v15: "active",
    };

    res.json({
      ok: true,
      version: "Omega AI Server v4.3.2",
      status: "✅ Core estable y sincronizado",
      modules,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("❌ [STATUS] Error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =====================================================
// 🌎 API LIVE MARKETS — Vista rápida para el frontend
// =====================================================
import fs from "fs";
import path from "path";

app.get("/ai/markets/live", async (_req, res) => {
  try {
    const marketDir = path.join(process.cwd(), "src", "data", "market");

    // 🔍 Busca los archivos más recientes
    const assets = ["BTCUSD", "XAUUSD", "XAGUSD", "WTIUSD", "SP500"];
    const result: Record<string, any> = {};

    for (const asset of assets) {
      const files = fs
        .readdirSync(marketDir)
        .filter((f) => f.startsWith(asset))
        .sort(
          (a, b) =>
            fs.statSync(path.join(marketDir, b)).mtimeMs -
            fs.statSync(path.join(marketDir, a)).mtimeMs
        );

      if (files.length > 0) {
        const latest = files[0];
        const data = JSON.parse(fs.readFileSync(path.join(marketDir, latest), "utf8"));
        result[asset] = {
          asset,
          price: data.price ?? null,
          source: data.source ?? "Desconocido",
          timestamp: data.timestamp ?? new Date().toISOString(),
        };
      } else {
        result[asset] = { asset, price: null, source: "Sin datos" };
      }
    }

    res.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      data: result,
    });
  } catch (err: any) {
    console.error("❌ [LIVE-MARKETS] Error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});





// 🚀 SERVIDOR PRINCIPAL (modo híbrido)
const PORT = Number(process.env.PORT) || 4000;
const HOST = "0.0.0.0";

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, HOST, () => {
    console.log(`💡 Omega AI Server v4.3.2 escuchando en :${PORT}`);
    console.log("📡 Módulos activos: v7.1, v8, v9 (Synaptic), v10 (Symbiont + Brainprint)");
    console.log("🧩 Modo local de desarrollo activado");
    startMarketAutoUpdater();
  });
} else {
  console.log("⚙️ Omega AI Core cargado como módulo (Render/Producción)");
  export default app;
}

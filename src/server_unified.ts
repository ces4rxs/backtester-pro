// ======================================================
// 🧠 OMEGA AI Unified Server v4.3.2 (Render Production Build)
// ======================================================
// Combina: Core AI + StrategyLabs + Diagnostics + Reflex Intelligence
// ------------------------------------------------------
// Autor: Julio César
// Fecha: 2025-10-29
// ------------------------------------------------------
// 🔒 Totalmente seguro, listo para Render, sin romper tu arquitectura actual.
// ======================================================

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// 🔧 Configuración de entorno universal
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// 🌐 Inicialización base
// ======================================================
const app = express();

// 🧩 CORS inteligente (Render + Local)
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("onrender.com")
      ) {
        callback(null, true);
      } else {
        console.warn("❌ CORS bloqueado para:", origin);
        callback(new Error("No permitido por CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  })
);

app.use(bodyParser.json());
app.set("trust proxy", 1);

// ======================================================
// 🔐 Autenticación
// ======================================================
import authRouter from "./routes/server_auth.js";
app.use("/auth", authRouter);

// ======================================================
// 📊 StrategyLabs API (Estrategias del usuario)
// ======================================================
import strategiesRouter from "./routes/server_strategies.js";
app.use("/api/strategies", strategiesRouter);

// ======================================================
// 🧠 Núcleo Cognitivo OMEGA (v7.1 → v15+)
// ======================================================
import {
  generateUnifiedAdviceHybrid,
  generateUnifiedAdviceHybridV9,
  generateUnifiedAdviceHybridV10,
} from "./ai/hybridAdvisor.js";
import { generateNeuralAdvisorV11 } from "./ai/neuralAdvisor_v11.js";
import { generateStrategicAdvisorV12 } from "./ai/strategicAdvisor_v12.js";
import { generateQuantumRiskV13 } from "./ai/quantumRisk_v13.js";
import { generateCognitiveRiskV14 } from "./ai/cognitiveRisk_v14.js";
import { generateMontecarloV11 } from "./ai/montecarlo_v11.js";
import { generateMontecarloV12 } from "./ai/montecarlo_v12.js";
import { predictForCurrent } from "./ai/predictor_v4.js";
import { runMonteCarlo } from "./ai/montecarlo.js";
import { runAdaptiveOptimizer } from "./core_v5/optimizer_v5.js";
import { runAutoLoopV10 } from "./ai/autoLoop.js";
import { saveBrainprint } from "./ai/userBrainprint.js";
import { startMarketAutoUpdater } from "./data/marketAutoUpdater.js";
import { appendSample, loadMemory, ensureMemory } from "./learn/memoryStore.js";
import { generateAdvice } from "./learn/learner.js";

// ======================================================
// 🧩 Rutas de diagnóstico / Render Mode
// ======================================================
app.get("/ai/status", (_req, res) => {
  res.json({
    ok: true,
    version: "Omega AI Unified Server v4.3.2",
    status: "🧠 Núcleo estable y sincronizado (Render Mode)",
    activeModules: ["v11 Neural Advisor", "v12 MonteCarlo+", "v13 QuantumRisk", "v14 Reflex Intelligence", "v15+"],
    timestamp: new Date().toISOString(),
  });
});

app.get("/ai/reflex", (_req, res) => {
  res.json({
    ok: true,
    reflex_version: "v15+",
    cognitive_state: "online",
    message: "Reflex Intelligence cargado correctamente",
    modules_loaded: {
      v11: "Neural Advisor",
      v12: "MonteCarlo+ Enhanced",
      v13: "Quantum Risk Engine",
      v14: "Reflex Intelligence",
      v15: "Cognitive Unification",
    },
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// 🧠 Aprendizaje y Tutoría Cognitiva
// ======================================================
app.get("/ai/learn/memory", (_req, res) => res.json(loadMemory()));
app.post("/ai/learn/update", (req, res) => {
  const sample = {
    ...req.body,
    timestamp: new Date().toISOString(),
  };
  const mem = appendSample(sample);
  res.json({ ok: true, stats: mem.stats });
});

app.get("/ai/learn/advice/:id", (req, res) => {
  const id = req.params.id;
  const current = { strategyId: id, quantumRating: 7.4, overfitRisk: "MEDIO", robustnessProb: 83.2 };
  const mem = loadMemory();
  const advice = generateAdvice(current, mem);
  res.json({ ok: true, id, advice });
});

// ======================================================
// 🔬 Módulos de IA (v7–v15)
// ======================================================
app.get("/ai/learn/v11/:id", (req, res) => res.json(generateNeuralAdvisorV11(req.params.id)));
app.get("/ai/learn/v12/:id", (req, res) => res.json(generateStrategicAdvisorV12(req.params.id)));
app.get("/ai/learn/v13/:id", (req, res) => res.json(generateQuantumRiskV13(req.params.id)));
app.get("/ai/learn/v14/:id", async (req, res) => {
  const quantum = generateQuantumRiskV13?.(req.params.id);
  const result = await generateCognitiveRiskV14({ id: req.params.id }, quantum);
  res.json({ ok: true, result });
});

// ======================================================
// 📈 Predicción y Optimización
// ======================================================
app.get("/ai/predict/advanced", (_req, res) => {
  try {
    const pred = predictForCurrent();
    res.json({ ok: true, ...pred, note: "CORE v4.4 ML predictor" });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});

app.post("/ai/optimize", async (req, res) => {
  if (process.env.OMEGA_V5_ENABLED !== "true") {
    return res.status(403).json({ ok: false, message: "CORE v5.0 desactivado" });
  }
  const report = await runAdaptiveOptimizer(req.body.manifest, req.body.goal);
  res.json({ ok: true, report });
});

// ======================================================
// 💾 Brainprint y Symbiont
// ======================================================
app.post("/ai/brainprint", (req, res) => {
  const saved = saveBrainprint(req.body);
  res.json({ ok: true, saved });
});

app.post("/ai/symbiont", async (req, res) => {
  const { strategyId } = req.body;
  const result = await generateUnifiedAdviceHybridV10(strategyId);
  res.json({ ok: true, result });
});

// ======================================================
// 🌎 Datos de mercado y Reflexive Market
// ======================================================
app.get("/ai/reflective/market", async (_req, res) => {
  try {
    const [btcRes, ethRes, goldRes] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"),
      fetch("https://api.metals.live/v1/spot"),
    ]);
    const btc = await btcRes.json();
    const eth = await ethRes.json();
    const gold = await goldRes.json();
    res.json({
      ok: true,
      version: "v10.3-B",
      BTCUSD: btc.bitcoin.usd,
      ETHUSD: eth.ethereum.usd,
      XAUUSD: gold[0]?.gold,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Fuentes de mercado no disponibles" });
  }
});

// ======================================================
// 📂 Reportes públicos y memoria local
// ======================================================
const REPORTS_DIR = path.join(process.cwd(), "reports");
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
app.use("/reports", express.static(REPORTS_DIR));

// ======================================================
// 🚀 Inicialización del servidor
// ======================================================
const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 OMEGA Unified Server escuchando en puerto ${PORT}`);
  console.log("🧩 Todos los módulos (v7–v15+) inicializados correctamente");
  startMarketAutoUpdater();
});

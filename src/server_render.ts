// 🧠 OMEGA AI Server - Render Full Diagnostics
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// 🧩 Importa el router de estrategias
import strategiesRouter from "./routes/server_strategies.js";

dotenv.config();

const app = express();

// ✅ CORS explícito para frontend local y producción
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://omega-ai-server-2.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-user-id"],
  })
);

app.use(bodyParser.json());

// ✅ Ruta de estado general
app.get("/ai/status", (req, res) => {
  res.json({
    ok: true,
    version: "Omega AI Server v4.3.2",
    status: "🧠 Core estable y sincronizado (Render Diagnostic Mode)",
    activeModules: [
      "v11 Neural Advisor",
      "v12 MonteCarlo+",
      "v13 QuantumRisk",
      "v14 Reflex Intelligence",
      "v15+ Cognitive Unification",
    ],
    timestamp: new Date().toISOString(),
  });
});

// ✅ Ruta de diagnóstico Reflex Intelligence
app.get("/ai/reflex", (req, res) => {
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

// ✅ NUEVO — StrategyLabs API (rutas seguras)
app.use("/api/strategies", strategiesRouter);

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🌍 OMEGA AI Server Render escuchando en puerto ${PORT}`);
  console.log("🧩 StrategyLabs v1-B habilitado correctamente");
});

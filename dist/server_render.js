// 🧠 OMEGA AI Server - Render Full Diagnostics
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
// 🧩 Importa el router de estrategias
import strategiesRouter from "./routes/server_strategies.js";
dotenv.config();
const app = express();
// ======================================================
// 🌐 CORS Inteligente — Compatibilidad total Render + Local
// ======================================================
app.use(cors({
    origin: (origin, callback) => {
        // Permitir si:
        // - No hay origin (peticiones internas o Postman)
        // - Es localhost (Next.js dev)
        // - Es tu dominio Render (backend)
        if (!origin ||
            origin.includes("localhost") ||
            origin.includes("127.0.0.1") ||
            origin.includes("onrender.com")) {
            callback(null, true);
        }
        else {
            console.warn("❌ CORS bloqueado para:", origin);
            callback(new Error("No permitido por CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-user-id"],
}));
// 🧩 Middleware de parsing
app.use(bodyParser.json());
// ======================================================
// 🧠 Estado general del servidor
// ======================================================
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
// ======================================================
// 🔁 Diagnóstico Reflex Intelligence
// ======================================================
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
// ======================================================
// 🧩 StrategyLabs API (rutas seguras)
// ======================================================
app.use("/api/strategies", strategiesRouter);
// ======================================================
// 🚀 Inicialización del servidor
// ======================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🌍 OMEGA AI Server Render escuchando en puerto ${PORT}`);
    console.log("🧩 StrategyLabs v1-B habilitado correctamente");
});

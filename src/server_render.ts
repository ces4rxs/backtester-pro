// 🧠 OMEGA AI Server - Render Minimal
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Ruta de estado básica
app.get("/ai/status", (req, res) => {
  res.json({
    ok: true,
    version: "Omega AI Server v4.3.2",
    status: "🧠 Core estable y sincronizado (Render Minimal)",
    timestamp: new Date().toISOString(),
  });
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🌍 OMEGA AI Server Render escuchando en puerto ${PORT}`);
});

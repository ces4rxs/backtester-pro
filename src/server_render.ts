// src/server_render.ts — 🧠 Omega AI Server (Render Edition)
// Solo carga Express + rutas y .env — sin módulos de IA

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/server_auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../backtester-pro/.env") });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rutas principales
app.use("/auth", authRouter);

// Ruta base de prueba
app.get("/", (req, res) => {
  res.json({ message: "🧠 Omega AI Server v4.3.2 Render Edition Running" });
});

// Puerto y servidor
const PORT = process.env.PORT || 4000;
const host = "0.0.0.0";
app.listen(Number(PORT), host, () => {
  console.log(`✅ Server online at http://${host}:${PORT}`);
});

export default app;

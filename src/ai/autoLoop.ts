// src/ai/autoLoop.ts — 🧠 OMEGA Auto-Learn v10.2
// Cierre del Bucle Cognitivo (Auto-Optimizer Loop)

import fs from "fs";
import path from "path";
import { runAdaptiveOptimizer } from "../core_v5/optimizer_v5.js";
import { predictForCurrent } from "./predictor_v4.js";

interface TutorMemory {
  version: string;
  summary: { sharpe: number; mdd: number; robustness: number; balance: string };
  insight: { tone: string; advice: string };
  generated: string;
  meta: { source: string };
}

export async function runAutoLoopV10() {
  console.log("♻️ Iniciando OMEGA Auto-Learn v10.2 (Cierre del Bucle Cognitivo)...");

  // 1️⃣ Leer el último archivo memory_tutor_v10.json
  const reportsDir = path.join(process.cwd(), "reports");
  const memoryPath = path.join(reportsDir, "memory_tutor_v10.json");
  if (!fs.existsSync(memoryPath)) throw new Error("No se encontró memory_tutor_v10.json");

  const memory: TutorMemory = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
  console.log("🧩 Reporte cargado:", memory.version, "-", memory.summary.balance);

  // 2️⃣ Decidir el objetivo (goal) según el tono cognitivo
  const tone = memory.insight.tone || "NEUTRO";
  const goal =
    tone === "NEGATIVO"
      ? { target: "mejorarSharpe", constraint: "reducirMDD", priority: "robustez" }
      : { target: "mantenerEstabilidad", constraint: "evitarSobreajuste", priority: "eficiencia" };

  console.log("🎯 Objetivo cognitivo:", goal);

  // 3️⃣ Crear un manifest base
  const baseManifest = {
    id: "auto_tuned_v10_2",
    name: "AutoTunedStrategy",
    metrics: {
      sharpe: memory.summary.sharpe,
      mdd: memory.summary.mdd,
      robustness: memory.summary.robustness,
    },
    params: { seed: Date.now() },
  };

  // 4️⃣ Adaptador al predictor v4.4 — compatibilidad universal
  const prophetPredict = async (variant: any) => {
    let pred: any;

    try {
      if (predictForCurrent.length >= 1) {
        pred = await Promise.resolve(predictForCurrent(variant));
      } else {
        pred = await Promise.resolve(predictForCurrent());
      }
    } catch (err) {
      console.warn("⚠️ Predictor v4 fallback activado:", err);
      pred = {};
    }

    return {
      predictedSharpe: Number(pred?.predictedSharpe ?? 0),
      predictedMDD: Number(pred?.predictedMDD ?? 0),
      antiOverfit: Number(pred?.antiOverfit ?? 0),
    };
  };

  // 5️⃣ Ejecutar optimización adaptativa
  const report = await runAdaptiveOptimizer(baseManifest as any, goal as any, { prophetPredict });
  const filePath = path.join(reportsDir, `auto_optimized_v10_2_${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

  console.log(`✅ Auto-Learn completado. Reporte guardado en: ${filePath}`);
  return { ok: true, report };
}

// src/test/testTutorV10.ts
// Prueba del Tutor v10.1 (lee memory_symbiont_v10.json y genera JSON + HTML)

import { runTutorV10 } from "../learn/tutor_v10.js";

console.log("🧩 Ejecutando test del Tutor Cognitivo v10.1...");
try {
  runTutorV10();
  console.log("✅ Tutor v10.1 ejecutado con éxito.");
} catch (err) {
  console.error("❌ Error al ejecutar el Tutor v10.1:", err);
}
// =====================================================
// 🚀 Enviar reporte al servidor Omega AI
// =====================================================
import axios from "axios";
import fs from "fs";
import path from "path";

async function sendTutorReport() {
  try {
    const reportPath = path.resolve("reports/memory_tutor_v10.json");
    if (!fs.existsSync(reportPath)) {
      console.warn("⚠️ No se encontró el reporte del tutor");
      return;
    }

    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const res = await axios.post("http://192.168.1.90:4000/ai/tutor/report", { report });
    console.log(`✅ Enviado al servidor Omega: ${res.data.message}`);
  } catch (err: any) {
    console.error("❌ Error al enviar reporte al servidor:", err.message);
  }
}

await sendTutorReport();

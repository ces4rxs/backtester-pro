// src/runAiAdaptive.ts
// 🧠 OMEGA – Adaptive Dataset Builder (Nivel 10.2 – Auto-Learn Loop)

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { buildDataset } from "./ai/adaptive.js"; // ✅ función real exportada

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log("🔥 Iniciando Fase Adaptativa OMEGA (v10.2 Auto-Learn Loop)...");
  console.log("📊 Reconstruyendo dataset unificado desde auditorías...");

  const { count, jsonPath, csvPath } = await buildDataset();

  console.log(`✅ Dataset reconstruido correctamente con ${count} filas.`);
  console.log(`📄 JSON: ${jsonPath}`);
  console.log(`📄 CSV: ${csvPath}`);

  const reportName = path.join(__dirname, "adaptive_report_summary.json");
  fs.writeFileSync(
    reportName,
    JSON.stringify({ count, jsonPath, csvPath, timestamp: new Date().toISOString() }, null, 2)
  );

  console.log(`💾 Reporte guardado: ${reportName} ✅`);
  console.log("🧠 Módulo adaptativo finalizado con éxito.");
} catch (err) {
  console.error("\n❌ Error fatal en el módulo adaptativo:", err);
}

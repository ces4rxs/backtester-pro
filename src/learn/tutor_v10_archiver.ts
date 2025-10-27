// src/learn/tutor_v10_archiver.ts
import fs from "fs";
import path from "path";
import { explainOptimizerReport } from "./tutor_v10_reader.js";

export async function explainAndSaveOptimizerReport() {
  console.log("🧠 Iniciando Symbiont Archiver v10.1...");
  const explanation = await explainOptimizerReport();

  const reportDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const outputPath = path.join(reportDir, "report_TutorV10.json");
  fs.writeFileSync(outputPath, JSON.stringify(explanation, null, 2), "utf-8");

  console.log(`💾 Reporte cognitivo guardado en: ${outputPath}`);
  console.log("✅ Proceso del Symbiont Archiver completado.\n");
}

// src/tools/exportCognitiveReportPDF.ts
// 📘 OMEGA Cognitive Report PDF Generator v14 (Stable pdfmake version)
// Sin dependencias externas inestables.
// Ejecutar con: npm run dashboard:pdf

import fs from "fs";
import path from "path";
import PdfPrinter from "pdfmake";

function getLatestReport(): string | null {
  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) return null;

  const files = fs
    .readdirSync(reportsDir)
    .filter((f) => f.startsWith("cognitive_report_") && f.endsWith(".json"))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(reportsDir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  return files.length > 0 ? path.join(reportsDir, files[0].name) : null;
}

async function main() {
  console.log("📘 Generando informe PDF técnico OMEGA Cognitive v14...");
  const reportPath = getLatestReport();

  if (!reportPath) {
    console.error("❌ No se encontró ningún archivo cognitive_report_*.json en /reports/");
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const outputFile = path.join(
    process.cwd(),
    "reports",
    `OMEGA_Cognitive_Report_v14_${Date.now()}.pdf`
  );

  // --- Datos ---
  const { strategyId, composite, modules, timestamp } = report;
  const risk = modules.v14?.risk?.riskScore ?? 0;
  const riskLevel = modules.v14?.risk?.level ?? "N/A";
  const entropy = modules.v11?.entropy ?? 0;
  const focus = modules.v12?.focusFactor ?? 0;
  const score = composite?.cognitiveScore ?? 0;
  const causes = modules.v14?.causes || [];
  const recs = modules.v14?.recommendations || [];
  const narrative = modules.v14?.narrative || "Sin narrativa disponible.";

  // --- Fuentes (obligatorias en pdfmake) ---
const fonts = {
  Roboto: {
    normal: "C:/Windows/Fonts/arial.ttf",
    bold: "C:/Windows/Fonts/arialbd.ttf",
    italics: "C:/Windows/Fonts/ariali.ttf",
    bolditalics: "C:/Windows/Fonts/arialbi.ttf",
  },
};

  const printer = new PdfPrinter(fonts);

  // --- Documento ---
  const docDefinition: any = {
    content: [
      { text: "OMEGA Cognitive Intelligence Report v14", style: "header" },
      { text: `Estrategia: ${strategyId}`, style: "subheader" },
      { text: `Generado: ${new Date(timestamp).toLocaleString()}`, style: "small" },
      { text: "──────────────────────────────────────────────", style: "divider" },

      {
        table: {
          widths: [150, 100, "*"],
          body: [
            ["Métrica", "Valor", "Descripción"],
            ["Riesgo (v14)", `${riskLevel} (${risk})`, "Clasificación del módulo cognitivo de riesgo."],
            ["Entropía (v11)", entropy.toFixed(3), "Dispersión de escenarios simulados."],
            ["Focus Factor (v12)", focus.toFixed(3), "Precisión media de predicciones reflexivas."],
            ["Cognitive Score", score.toFixed(2), "Puntaje compuesto de coherencia y adaptabilidad."],
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 10, 0, 20],
      },

      { text: "Análisis Causal y Recomendaciones", style: "sectionTitle" },
      { text: narrative, margin: [0, 0, 0, 10] },
      ...(causes.length
        ? [{ text: "🧩 Causas identificadas:", bold: true }, ...causes.map((c: string) => `• ${c}`)]
        : []),
      ...(recs.length
        ? [{ text: "\n🔧 Recomendaciones técnicas:", bold: true }, ...recs.map((r: string) => `• ${r}`)]
        : []),

      { text: "\nMétricas de distribución (v11 / v12)", style: "sectionTitle" },
      {
        table: {
          widths: [150, 120, "*"],
          body: [
            ["Parámetro", "v11", "v12"],
            ["Escenarios", modules.v11?.scenarios ?? "N/A", modules.v12?.scenarios ?? "N/A"],
            ["Modo", modules.v11?.mode ?? "N/A", modules.v12?.mode ?? "N/A"],
            ["Narrativa", modules.v11?.summary ?? "-", modules.v12?.narrative ?? "-"],
          ],
        },
        layout: "lightHorizontalLines",
      },

      { text: "\n──────────────────────────────────────────────", style: "divider" },
      { text: "OMEGA Cognitive Engine © 2025 — Quantum Risk Division", style: "footer" },
    ],

    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 10, italics: true },
      small: { fontSize: 8, color: "#555" },
      divider: { color: "#999", margin: [0, 10, 0, 10] },
      sectionTitle: { fontSize: 13, bold: true, margin: [0, 10, 0, 5] },
      footer: { fontSize: 8, italics: true, color: "#555", margin: [0, 20, 0, 0] },
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const writeStream = fs.createWriteStream(outputFile);
  pdfDoc.pipe(writeStream);
  pdfDoc.end();

  writeStream.on("finish", () => {
    console.log(`✅ PDF técnico generado: ${outputFile}`);
  });
}

main().catch((err) => console.error("❌ Error generando PDF:", err));

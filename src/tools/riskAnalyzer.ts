// src/tools/riskAnalyzer.ts
// 📊 Quantum Risk Analyzer v1.1 – Mandamiento V: Riesgo Coherente
// Corrección: soporte flexible de nombres de columnas y prevención de NaN.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Decimal } from "decimal.js";
import * as Plotly from "plotly.js-dist-min";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Leer CSV de auditoría con detección flexible
function readCSV(filePath: string) {
  const text = fs.readFileSync(filePath, "utf8");
  const [header, ...rows] = text.trim().split("\n");
  const keys = header.split(",").map(k => k.trim().toLowerCase());
  return rows.map(row => {
    const values = row.split(",").map(v => v.trim());
    const obj: Record<string, string> = {};
    keys.forEach((k, i) => (obj[k] = values[i]));
    return obj;
  });
}

// ✅ Calcular métricas de riesgo
function computeRiskMetrics(equities: number[]) {
  if (equities.length === 0) return { VaR_95: 0, CVaR_95: 0, MaxDrawdown: 0, TailRatio: 0 };

  const sorted = [...equities].sort((a, b) => a - b);
  const n = sorted.length;
  const var95 = sorted[Math.floor(n * 0.05)];
  const tailLosses = sorted.slice(0, Math.floor(n * 0.05));
  const cvar95 = tailLosses.length > 0 ? tailLosses.reduce((a, b) => a + b, 0) / tailLosses.length : 0;

  let peak = equities[0];
  let maxDrawdown = 0;
  for (const val of equities) {
    peak = Math.max(peak, val);
    maxDrawdown = Math.max(maxDrawdown, (peak - val) / peak);
  }

  const gains = sorted.slice(Math.floor(n * 0.95));
  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
  const tailRatio = cvar95 !== 0 ? avgGain / Math.abs(cvar95) : 0;

  return {
    VaR_95: Number(var95.toFixed(4)),
    CVaR_95: Number(cvar95.toFixed(4)),
    MaxDrawdown: Number(maxDrawdown.toFixed(4)),
    TailRatio: Number(tailRatio.toFixed(4)),
  };
}

// ✅ Gráficos Plotly
async function generatePlots(data: number[], outDir: string) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const sorted = [...data].sort((a, b) => a - b);

  const fig1 = {
    data: [{ x: sorted, type: "histogram", nbinsx: 30 }],
    layout: {
      title: "Distribución de Equity Final (Riesgo Coherente)",
      xaxis: { title: "Equity Final" },
      yaxis: { title: "Frecuencia" },
      template: "plotly_dark",
    },
  };

  const htmlPath = path.join(outDir, "risk_distribution.html");
  const htmlContent = `
  <html><head><meta charset="UTF-8"><title>Risk Distribution</title></head>
  <body><div id="chart"></div>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
  <script>Plotly.newPlot('chart', ${JSON.stringify(fig1.data)}, ${JSON.stringify(fig1.layout)});</script>
  </body></html>`;
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✅ Gráfico HTML generado: ${htmlPath}`);
}

// ✅ Entrada principal
async function main() {
  const [csvFile = "auditoria.csv", outDir = "./reports/risk"] = process.argv.slice(2);
  const records = readCSV(csvFile);

  // 🧠 Detectar la columna correcta (equity, equityfinal, etc.)
  const first = records[0] || {};
  const key = Object.keys(first).find(k =>
    k.includes("equity") || k.includes("balance") || k.includes("final")
  );
  if (!key) {
    console.error("❌ No se encontró ninguna columna de equity en el CSV.");
    return;
  }

  const equities = records
    .map(r => parseFloat(r[key]))
    .filter(x => !isNaN(x) && isFinite(x));

  const metrics = computeRiskMetrics(equities);
  console.log("📉 Métricas de Riesgo Coherente:");
  console.table(metrics);

  await generatePlots(equities, outDir);

  const summaryPath = path.join(outDir, "risk_summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(metrics, null, 2));
  console.log(`💾 Resultados exportados a: ${summaryPath}`);
}

main().catch(err => console.error("❌ Error en riskAnalyzer:", err));

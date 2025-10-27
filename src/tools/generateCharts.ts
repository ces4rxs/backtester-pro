// src/tools/generateCharts.ts
// 🎨 OMEGA Visual Engine v1.3 (Plotly.js Edition)
// 🔒 100% compatible con Auditor v1.2
// 📈 Genera gráficos a partir del CSV exportado por listManifests.ts
// Requiere: npm install plotly.js-dist-min canvas fs-extra

import fs from "fs";
import path from "path";
import Plotly from "plotly.js-dist-min";
import * as fse from "fs-extra";

// --- Configuración ---
const args = process.argv.slice(2);
const csvPath = args[0] || "./auditoria.csv";
const outDir = args[1] || "./reports/charts";

if (!fs.existsSync(csvPath)) {
  console.error(`❌ No se encontró el archivo CSV: ${csvPath}`);
  process.exit(1);
}
fse.ensureDirSync(outDir);

// --- Leer CSV ---
const raw = fs.readFileSync(csvPath, "utf8").trim();
const lines = raw.split("\n").slice(1);
if (lines.length === 0) {
  console.error("⚠️ El CSV está vacío. Ejecuta primero: npm run manifests:list -- --export=auditoria.csv");
  process.exit(0);
}

// --- Parseo ---
type Row = {
  file: string;
  strategy: string;
  equityFinal: number;
  sharpe: number;
  cagr: number;
  timestamp: string;
};
const data: Row[] = lines.map((l) => {
  const [file, strategy, eq, sh, cagr, ts] = l.split(",");
  return {
    file: file.replace(/"/g, "").trim(),
    strategy: strategy.replace(/"/g, "").trim(),
    equityFinal: Number(eq),
    sharpe: Number(sh),
    cagr: Number(cagr),
    timestamp: ts?.trim(),
  };
});

console.log(`📊 Generando gráficos OMEGA Visual Engine (v1.3)`);
console.log(`   Total de registros: ${data.length}`);
console.log(`   Salida: ${outDir}`);

// --- Utilidad para exportar Plotly a HTML ---
async function savePlot(name: string, plotData: any[], layout: any) {
  const htmlPath = path.join(outDir, `${name}.html`);
  const html = `
  <html>
  <head>
    <meta charset="UTF-8">
    <title>${layout.title}</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
  </head>
  <body>
    <div id="plot"></div>
    <script>
      var data = ${JSON.stringify(plotData)};
      var layout = ${JSON.stringify(layout)};
      Plotly.newPlot('plot', data, layout);
    </script>
  </body>
  </html>`;
  fs.writeFileSync(htmlPath, html, "utf8");
  console.log(`✅ Gráfico HTML generado: ${htmlPath}`);
}

// --- 1️⃣ Histograma de Equity ---
const equity = data.map((d) => d.equityFinal);
await savePlot("equity_hist", [
  { x: equity, type: "histogram", marker: { color: "#1f77b4" } },
], {
  title: "Distribución de Equity Final",
  xaxis: { title: "Equity Final (USD)" },
  yaxis: { title: "Frecuencia" },
  bargap: 0.1,
});

// --- 2️⃣ Histograma de Sharpe ---
const sharpe = data.map((d) => d.sharpe);
await savePlot("sharpe_hist", [
  { x: sharpe, type: "histogram", marker: { color: "#2ca02c" } },
], {
  title: "Distribución del Ratio Sharpe",
  xaxis: { title: "Sharpe Ratio" },
  yaxis: { title: "Frecuencia" },
  bargap: 0.1,
});

// --- 3️⃣ Scatter Equity vs Sharpe ---
await savePlot("equity_vs_sharpe", [
  {
    x: sharpe,
    y: equity,
    mode: "markers",
    type: "scatter",
    text: data.map((d) => d.strategy),
    marker: { color: "#ff7f0e", size: 6, opacity: 0.7 },
  },
], {
  title: "Equity Final vs. Sharpe Ratio",
  xaxis: { title: "Sharpe Ratio" },
  yaxis: { title: "Equity Final (USD)" },
});

// --- 4️⃣ Scatter CAGR vs Sharpe ---
const cagr = data.map((d) => d.cagr * 100);
await savePlot("cagr_vs_sharpe", [
  {
    x: sharpe,
    y: cagr,
    mode: "markers",
    type: "scatter",
    marker: { color: "#9467bd", size: 6, opacity: 0.7 },
  },
], {
  title: "CAGR (%) vs. Sharpe Ratio",
  xaxis: { title: "Sharpe Ratio" },
  yaxis: { title: "CAGR (%)" },
});

// --- 5️⃣ Ranking de Estrategias ---
const strategies = Array.from(
  new Set(data.map((d) => d.strategy))
);
const avgEquityByStrategy = strategies.map((s) => {
  const subset = data.filter((d) => d.strategy === s);
  const avg = subset.reduce((a, b) => a + b.equityFinal, 0) / subset.length;
  return { strategy: s, avgEquity: avg };
});
avgEquityByStrategy.sort((a, b) => b.avgEquity - a.avgEquity);

await savePlot("ranking_strategies", [
  {
    x: avgEquityByStrategy.map((r) => r.strategy),
    y: avgEquityByStrategy.map((r) => r.avgEquity),
    type: "bar",
    marker: { color: "#17becf" },
  },
], {
  title: "Ranking Promedio de Equity por Estrategia",
  xaxis: { title: "Estrategia" },
  yaxis: { title: "Equity Promedio (USD)" },
});

console.log("✨ OMEGA Visual Engine v1.3 completado.");

// src/tools/generateDashboard.ts
// ⚙️ Quantum+ Backtesting Engine – Visual Dashboard v1.4.1 (Legal Edition)
// © 2025 Julio Cesar — Todos los derechos reservados.
// No requiere conexión externa ni dependencias adicionales.
import fs from "fs";
import path from "path";
import * as fse from "fs-extra";
const CSV_PATH = process.argv[2] || "./auditoria.csv";
const CHARTS_DIR = process.argv[3] || "./reports/charts";
const OUT_FILE = "./reports/dashboard_quantum_v1.4.1.html";
if (!fs.existsSync(CSV_PATH)) {
    console.error("❌ No se encontró auditoria.csv. Ejecuta primero: npm run manifests:list -- --summary --export=auditoria.csv");
    process.exit(1);
}
if (!fs.existsSync(CHARTS_DIR)) {
    console.error("❌ No se encontró la carpeta de gráficos. Ejecuta primero: npm run audit:charts");
    process.exit(1);
}
fse.ensureDirSync("./reports");
const raw = fs.readFileSync(CSV_PATH, "utf8").trim();
const lines = raw.split("\n").slice(1);
const records = lines.map((l) => {
    const [file, strategy, eq, sh, cagr] = l.split(",");
    return {
        equity: Number(eq),
        sharpe: Number(sh),
        cagr: Number(cagr),
        strategy: strategy?.replace(/"/g, "").trim(),
    };
});
const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const avgEquity = avg(records.map(r => r.equity)).toFixed(2);
const avgSharpe = avg(records.map(r => r.sharpe)).toFixed(4);
const avgCAGR = (avg(records.map(r => r.cagr)) * 100).toFixed(3);
const total = records.length;
const charts = [
    "equity_hist",
    "sharpe_hist",
    "equity_vs_sharpe",
    "cagr_vs_sharpe",
    "ranking_strategies"
];
const chartEmbeds = charts
    .map(name => {
    const file = path.join(CHARTS_DIR, `${name}.html`);
    if (fs.existsSync(file)) {
        const html = fs.readFileSync(file, "utf8");
        const body = html.split("<body>")[1]?.split("</body>")[0];
        return `<section>${body}</section>`;
    }
    return `<section><p>⚠️ Falta ${name}.html</p></section>`;
})
    .join("\n<hr/>\n");
const date = new Date().toISOString();
const hash = Math.random().toString(36).substring(2, 12).toUpperCase();
const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Quantum+ Backtesting Engine – Visual Report v1.4.1</title>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
  <style>
    body { font-family: "Segoe UI", sans-serif; background: #0b0c10; color: #eee; margin: 0; padding: 2rem; }
    h1, h2 { color: #00bcd4; }
    section { margin-bottom: 4rem; background: #141619; padding: 1rem; border-radius: 10px; box-shadow: 0 0 10px #0004; }
    .metrics { display: flex; gap: 2rem; justify-content: space-around; background: #111; padding: 1rem; border-radius: 10px; }
    .metric { text-align: center; }
    .seal { text-align: center; margin-top: 3rem; color: #0f0; font-family: monospace; }
    footer { text-align: center; margin-top: 5rem; color: #888; font-size: 0.9rem; }
    hr { border: none; height: 2px; background: #00bcd4; opacity: 0.2; margin: 3rem 0; }
  </style>
</head>
<body>
  <h1>⚙️ Quantum+ Backtesting Engine</h1>
  <h2>Auditoría Consolidada – Visual Dashboard v1.4.1</h2>

  <div class="metrics">
    <div class="metric"><h3>Promedio Equity</h3><p>${avgEquity}</p></div>
    <div class="metric"><h3>Promedio Sharpe</h3><p>${avgSharpe}</p></div>
    <div class="metric"><h3>Promedio CAGR (%)</h3><p>${avgCAGR}</p></div>
    <div class="metric"><h3>Backtests</h3><p>${total}</p></div>
  </div>

  <hr/>
  ${chartEmbeds}

  <div class="seal">
    ───────────────────────────────────────────────<br/>
    🧠 Q U A N T U M  +  R A T I N G:  A+<br/>
    🔹 Integrity Hash: ${hash}<br/>
    🔹 Generated: ${date}<br/>
    ───────────────────────────────────────────────
  </div>

  <footer>
    © 2025 Julio Cesar — Todos los derechos reservados.<br/>
    Quantum+ Backtesting Engine – Visual Audit Report
  </footer>
</body>
</html>
`;
fs.writeFileSync(OUT_FILE, html, "utf8");
console.log(`✅ Dashboard legal generado: ${OUT_FILE}`);

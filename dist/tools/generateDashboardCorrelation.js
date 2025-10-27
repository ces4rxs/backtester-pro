// src/tools/generateDashboardCorrelation.ts
// 📊 Quantum Dashboard v1.7.1 – Correlación Riesgo–Rendimiento (versión estable Node + Plotly)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function main() {
    const [csvFile = "auditoria.csv", chartsDir = "./reports/charts", riskDir = "./reports/risk"] = process.argv.slice(2);
    const dashboardBase = path.join("./reports", "dashboard_quantum_v1.6.html");
    const outputPath = path.join("./reports", "dashboard_quantum_v1.7.html");
    const riskSummary = path.join(riskDir, "risk_summary.json");
    if (!fs.existsSync(dashboardBase)) {
        console.error("❌ No se encontró el dashboard base:", dashboardBase);
        return;
    }
    if (!fs.existsSync(csvFile)) {
        console.error("❌ No se encontró el CSV de auditoría:", csvFile);
        return;
    }
    if (!fs.existsSync(riskSummary)) {
        console.error("❌ No se encontró el resumen de riesgo:", riskSummary);
        return;
    }
    const risk = JSON.parse(fs.readFileSync(riskSummary, "utf8"));
    const csv = fs.readFileSync(csvFile, "utf8");
    const lines = csv.trim().split("\n").slice(1);
    const records = lines.map(l => {
        const [strategy, equity, sharpe, cagr] = l.split(",");
        return { strategy, equity: +equity, sharpe: +sharpe, cagr: +cagr };
    });
    const equityVals = records.map(r => r.equity);
    const sharpeVals = records.map(r => r.sharpe);
    // --- Función para generar gráficos Plotly en HTML ---
    function generatePlotlyHTML(title, xTitle, yTitle, xData, yData, color) {
        return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
  </head>
  <body style="background:#111;">
    <div id="chart" style="width:100%;height:100%;"></div>
    <script>
      const trace = {
        x: ${JSON.stringify(xData)},
        y: ${JSON.stringify(yData)},
        mode: 'markers',
        marker: { color: '${color}' },
        name: '${title}'
      };
      const layout = {
        title: '${title}',
        xaxis: { title: '${xTitle}' },
        yaxis: { title: '${yTitle}' },
        paper_bgcolor: '#111',
        plot_bgcolor: '#111',
        font: { color: '#fff' }
      };
      Plotly.newPlot('chart', [trace], layout);
    </script>
  </body>
</html>`;
    }
    // --- Generamos los tres gráficos y los guardamos ---
    const plots = [
        { name: "equity_vs_var", title: "Equity vs VaR (95%)", x: Array(equityVals.length).fill(risk.VaR_95), y: equityVals, color: "cyan" },
        { name: "equity_vs_cvar", title: "Equity vs CVaR (95%)", x: Array(equityVals.length).fill(risk.CVaR_95), y: equityVals, color: "orange" },
        { name: "sharpe_vs_tail", title: "Sharpe vs Tail Ratio", x: sharpeVals, y: Array(sharpeVals.length).fill(risk.TailRatio), color: "lime" },
    ];
    for (const p of plots) {
        const html = generatePlotlyHTML(p.title, p.title.split("vs")[1].trim(), p.title.split("vs")[0].trim(), p.x, p.y, p.color);
        fs.writeFileSync(path.join(chartsDir, `${p.name}.html`), html, "utf8");
    }
    // --- Insertamos la nueva sección en el dashboard ---
    const dashboard = fs.readFileSync(dashboardBase, "utf8");
    const section = `
  <section id="risk-correlation" style="margin-top:40px;padding:20px;border-top:2px solid #444;">
    <h2 style="font-family:Arial,Helvetica,sans-serif;color:#00ffaa;">
      🔗 Matriz de Correlación Riesgo–Rendimiento
    </h2>
    <p style="color:#ccc;font-size:14px;">
      Este módulo explora la relación entre rendimiento (Equity, Sharpe) y riesgo (VaR, CVaR, TailRatio).
    </p>
    <div style="margin-top:20px;">
      <iframe src="./charts/equity_vs_var.html" width="90%" height="400" style="border:none;background:#111;"></iframe>
      <iframe src="./charts/equity_vs_cvar.html" width="90%" height="400" style="border:none;background:#111;margin-top:15px;"></iframe>
      <iframe src="./charts/sharpe_vs_tail.html" width="90%" height="400" style="border:none;background:#111;margin-top:15px;"></iframe>
    </div>
  </section>
  `;
    const updatedHtml = dashboard.replace("</body>", `${section}\n</body>`);
    fs.writeFileSync(outputPath, updatedHtml, "utf8");
    console.log("✅ Dashboard Quantum v1.7.1 generado con éxito:", outputPath);
}
main().catch(err => console.error("❌ Error en generación de correlación:", err));

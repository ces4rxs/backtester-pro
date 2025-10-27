// src/tools/generateDashboardRisk.ts
// 🧭 Quantum Dashboard v1.5 – Integración de Riesgo Coherente

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [csvFile = "auditoria.csv", chartsDir = "./reports/charts", riskDir = "./reports/risk"] = process.argv.slice(2);

  const dashboardPath = path.join("./reports", "dashboard_quantum_v1.4.1.html");
  const outputPath = path.join("./reports", "dashboard_quantum_v1.5.html");
  const riskSummaryPath = path.join(riskDir, "risk_summary.json");

  if (!fs.existsSync(dashboardPath)) {
    console.error("❌ No se encontró el dashboard base:", dashboardPath);
    return;
  }

  if (!fs.existsSync(riskSummaryPath)) {
    console.error("❌ No se encontró el resumen de riesgo:", riskSummaryPath);
    return;
  }

  const html = fs.readFileSync(dashboardPath, "utf8");
  const riskData = JSON.parse(fs.readFileSync(riskSummaryPath, "utf8"));

  const section = `
  <section id="risk-coherence" style="margin-top:40px;padding:20px;border-top:2px solid #444;">
    <h2 style="font-family:Arial,Helvetica,sans-serif;color:#00ffaa;">
      ⚖️ Análisis de Riesgo Coherente
    </h2>
    <p style="color:#ccc;font-size:14px;">
      Este módulo evalúa el riesgo financiero bajo condiciones adversas mediante VaR (Value at Risk), CVaR (Conditional Value at Risk), y Max Drawdown.
    </p>
    <table style="width:60%;border-collapse:collapse;margin-top:10px;">
      <tr><th style="border:1px solid #444;padding:8px;color:#00ffaa;">Métrica</th>
          <th style="border:1px solid #444;padding:8px;color:#00ffaa;">Valor</th></tr>
      <tr><td style="border:1px solid #444;padding:8px;">VaR (95%)</td>
          <td style="border:1px solid #444;padding:8px;">${riskData.VaR_95.toLocaleString()}</td></tr>
      <tr><td style="border:1px solid #444;padding:8px;">CVaR (95%)</td>
          <td style="border:1px solid #444;padding:8px;">${riskData.CVaR_95.toLocaleString()}</td></tr>
      <tr><td style="border:1px solid #444;padding:8px;">Max Drawdown</td>
          <td style="border:1px solid #444;padding:8px;">${(riskData.MaxDrawdown * 100).toFixed(2)}%</td></tr>
      <tr><td style="border:1px solid #444;padding:8px;">Tail Ratio</td>
          <td style="border:1px solid #444;padding:8px;">${riskData.TailRatio.toFixed(4)}</td></tr>
    </table>
    <p style="margin-top:15px;color:#ccc;">
      📊 Ver gráfico interactivo de distribución: 
      <a href="./risk/risk_distribution.html" style="color:#00ffaa;text-decoration:none;">Abrir gráfico</a>
    </p>
  </section>
  `;

  const updatedHtml = html.replace("</body>", `${section}\n</body>`);
  fs.writeFileSync(outputPath, updatedHtml, "utf8");

  console.log(`✅ Dashboard extendido generado: ${outputPath}`);
}

main().catch(err => console.error("❌ Error al generar Dashboard de Riesgo:", err));

// src/tools/generateDashboardRiskEmbed.ts
// ⚖️ Quantum Dashboard v1.6 – Mini Visualización de Riesgo Embebida (sin romper estructura previa)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function main() {
    const [csvFile = "auditoria.csv", chartsDir = "./reports/charts", riskDir = "./reports/risk"] = process.argv.slice(2);
    const dashboardBase = path.join("./reports", "dashboard_quantum_v1.5.html");
    const outputPath = path.join("./reports", "dashboard_quantum_v1.6.html");
    const riskSummary = path.join(riskDir, "risk_summary.json");
    const riskChart = path.join(riskDir, "risk_distribution.html");
    if (!fs.existsSync(dashboardBase)) {
        console.error("❌ No se encontró el dashboard base:", dashboardBase);
        return;
    }
    if (!fs.existsSync(riskSummary)) {
        console.error("❌ No se encontró el archivo de métricas de riesgo:", riskSummary);
        return;
    }
    const html = fs.readFileSync(dashboardBase, "utf8");
    const riskData = JSON.parse(fs.readFileSync(riskSummary, "utf8"));
    const section = `
  <section id="risk-embedded" style="margin-top:40px;padding:20px;border-top:2px solid #444;">
    <h2 style="font-family:Arial,Helvetica,sans-serif;color:#00ffaa;">
      🧮 Visualización de Riesgo Coherente (v1.6)
    </h2>
    <p style="color:#ccc;font-size:14px;">
      Este módulo combina las métricas cuantitativas con una visualización embebida del histograma de distribución de riesgo.
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

    <div style="margin-top:25px;">
      <iframe src="./risk/risk_distribution.html" 
              width="90%" height="500" 
              style="border:2px solid #333;border-radius:10px;background:#111;">
      </iframe>
    </div>
  </section>
  `;
    const newHtml = html.replace("</body>", `${section}\n</body>`);
    fs.writeFileSync(outputPath, newHtml, "utf8");
    console.log(`✅ Dashboard Quantum v1.6 generado con visualización embebida: ${outputPath}`);
}
main().catch(err => console.error("❌ Error en Dashboard v1.6:", err));

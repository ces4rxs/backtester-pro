// src/ai/reflex_v15_plus.ts — 🧠 Omega Reflex v15+ (Visual + Reflective Market)
// Analiza reportes cognitivos previos y combina el entorno de mercado real vía /ai/reflective/market
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
console.log("🧠 Iniciando Omega Reflex v15+ (Modo Visual + Reflective Market)…");
const reportsDir = path.join(process.cwd(), "reports");
const baseFile = path.join(reportsDir, "cognitive_report_ultima.json");
const outputFile = path.join(reportsDir, `reflex_summary_v15plus_${Date.now()}.json`);
const htmlFile = path.join(reportsDir, "reflex_dashboard_v15plus.html");
if (!fs.existsSync(baseFile)) {
    console.error("❌ No se encontró cognitive_report_ultima.json en /reports");
    process.exit(1);
}
(async () => {
    try {
        // === Leer reporte cognitivo base ===
        const report = JSON.parse(fs.readFileSync(baseFile, "utf8"));
        const quantumRating = Number(report.quantumRating ?? 0);
        const robustness = parseFloat(String(report.robustness ?? "0").replace("%", ""));
        const overfitRisk = report.overfitRisk ?? "DESCONOCIDO";
        const integrity = report.integrity ?? false;
        const reflexIndex = Number(((quantumRating * 0.4 +
            robustness * 0.3 +
            (integrity ? 10 : 0) -
            (overfitRisk === "ALTO" ? 15 : overfitRisk === "MEDIO" ? 5 : 0)) /
            1.2).toFixed(2));
        // === Insight cognitivo ===
        const insight = reflexIndex > 85
            ? "La estrategia muestra autocoherencia cognitiva y bajo sesgo adaptativo."
            : reflexIndex > 70
                ? "Nivel óptimo de coherencia entre riesgo y retorno. Mantener monitorización adaptativa."
                : reflexIndex > 50
                    ? "Evidencia de fatiga cognitiva: revisar consistencia entre runs Montecarlo."
                    : "Posible deterioro de robustez cognitiva. Recomendada re-evaluación del patrón sináptico.";
        // === Fetch del entorno de mercado (seguro, con fallback) ===
        let market = {};
        try {
            const res = await fetch("http://localhost:4000/ai/reflective/market");
            market = (await res.json()) ?? {};
        }
        catch {
            console.warn("⚠️ No se pudo obtener datos de mercado; usando modo simulado.");
            market = {
                ok: true,
                version: "v10.3-B (Offline)",
                data: {
                    BTCUSD: 68000,
                    ETHUSD: 3600,
                    XAUUSD: 2380,
                    SP500: 5230,
                    USDCOP: 4200,
                },
                correlations: {
                    "BTC-Oro": +0.67,
                    "BTC-S&P500": +0.41,
                    "Oro-S&P500": -0.12,
                    "BTC-ETH": +0.83,
                },
            };
        }
        // === Guardar JSON resumen ===
        const reflexReport = {
            version: "v15-Reflective",
            timestamp: new Date().toISOString(),
            metrics: { quantumRating, robustness, overfitRisk, integrity, reflexIndex },
            market,
            summary: {
                coherence: reflexIndex >= 75 ? "ALTA" : reflexIndex >= 55 ? "MEDIA" : "BAJA",
                evaluation: insight,
            },
        };
        fs.writeFileSync(outputFile, JSON.stringify(reflexReport, null, 2));
        // === Dashboard HTML ===
        const color = reflexIndex >= 85 ? "#00ff88" : reflexIndex >= 60 ? "#ffe600" : "#ff4d4d";
        const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>OMEGA Reflex v15+ Dashboard</title>
<style>
body {
  font-family: 'Segoe UI', sans-serif;
  background: #0b0b0b;
  color: #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}
.card {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 25px 35px;
  margin: 20px;
  width: 85%;
  max-width: 800px;
  box-shadow: 0 0 15px rgba(255,255,255,0.08);
}
.circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(${color} ${(reflexIndex / 100) * 360}deg, #333 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 0 25px ${color}80;
  margin: 0 auto 20px auto;
}
h1 { color: ${color}; text-align: center; }
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
td, th {
  border-bottom: 1px solid #333;
  padding: 6px 10px;
  text-align: left;
}
footer {
  margin-top: 30px;
  color: #888;
  font-size: 0.85em;
}
</style>
</head>
<body>
<h1>🧠 Omega Reflex v15+ — Dashboard Cognitivo + Entorno de Mercado</h1>

<div class="card">
  <div class="circle">${reflexIndex}</div>
  <h2>Índice Cognitivo</h2>
  <p><b>Coherencia:</b> ${reflexReport.summary.coherence}</p>
  <p><b>Evaluación:</b> ${insight}</p>
</div>

<div class="card">
  <h2>Métricas Base</h2>
  <ul>
    <li>Quantum Rating: <b>${quantumRating}</b></li>
    <li>Robustez: <b>${robustness}%</b></li>
    <li>Integridad: <b>${integrity ? "Sí" : "No"}</b></li>
    <li>Riesgo de sobreajuste: <b>${overfitRisk}</b></li>
  </ul>
</div>

<div class="card">
  <h2>🌍 Entorno de Mercado Cognitivo</h2>
  <table>
    <tr><th>Activo</th><th>Precio</th></tr>
    <tr><td>BTC/USD</td><td>$${market.data?.BTCUSD?.toLocaleString() ?? "N/D"}</td></tr>
    <tr><td>ETH/USD</td><td>$${market.data?.ETHUSD?.toLocaleString() ?? "N/D"}</td></tr>
    <tr><td>Oro (XAU/USD)</td><td>$${market.data?.XAUUSD?.toLocaleString() ?? "N/D"}</td></tr>
    <tr><td>S&P 500</td><td>${market.data?.SP500 ?? "N/D"}</td></tr>
    <tr><td>USD/COP</td><td>${market.data?.USDCOP ?? "N/D"}</td></tr>
  </table>
  <h3>📈 Correlaciones</h3>
  <pre>${JSON.stringify(market.correlations, null, 2)}</pre>
</div>

<footer>OMEGA Cognitive Core v15+ • Integración Reflectiva • ${new Date().toLocaleString()}</footer>
</body>
</html>`;
        fs.writeFileSync(htmlFile, html);
        console.log(`✅ Reflex v15+ completado.`);
        console.log(`📘 JSON: ${outputFile}`);
        console.log(`🌐 HTML: ${htmlFile}`);
        console.log(`💡 Insight: ${insight}`);
    }
    catch (err) {
        console.error("❌ Error en Reflex v15+:", err.message);
        process.exit(1);
    }
})();

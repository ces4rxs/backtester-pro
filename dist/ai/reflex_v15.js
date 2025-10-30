// src/ai/reflex_v15.ts — 🧠 Omega Reflex v15 (Modo Pasivo + Dashboard Visual)
// Lee reportes cognitivos previos y genera un resumen reflexivo v15 con salida HTML y JSON.
import fs from "fs";
import path from "path";
console.log("🧠 Iniciando Omega Reflex v15 (Modo Pasivo + Visual)…");
// 📂 Rutas base
const reportsDir = path.join(process.cwd(), "reports");
const baseFile = path.join(reportsDir, "cognitive_report_ultima.json");
const outputFile = path.join(reportsDir, `reflex_summary_v15_${Date.now()}.json`);
const htmlFile = path.join(reportsDir, "reflex_dashboard_v15.html");
if (!fs.existsSync(baseFile)) {
    console.error("❌ No se encontró cognitive_report_ultima.json en /reports");
    process.exit(1);
}
try {
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
    const insight = reflexIndex > 85
        ? "La estrategia muestra autocoherencia cognitiva y bajo sesgo adaptativo."
        : reflexIndex > 70
            ? "Nivel óptimo de coherencia entre riesgo y retorno. Mantener monitorización adaptativa."
            : reflexIndex > 50
                ? "Evidencia de fatiga cognitiva: revisar consistencia entre runs Montecarlo."
                : "Posible deterioro de robustez cognitiva. Recomendada re-evaluación del patrón sináptico.";
    const reflexReport = {
        version: "v15-Passive",
        timestamp: new Date().toISOString(),
        metrics: {
            quantumRating,
            robustness,
            overfitRisk,
            integrity,
            reflexIndex,
        },
        summary: {
            coherence: reflexIndex >= 75 ? "ALTA" : reflexIndex >= 55 ? "MEDIA" : "BAJA",
            evaluation: insight,
        },
        recommendations: [
            "Actualizar dataset de aprendizaje antes del próximo ciclo v16.",
            "Ejecutar validación cruzada sobre 3 activos (BTC, XAU, SP500).",
            "Re-entrenar Symbiont Advisor si el Reflex Index < 60.",
        ],
    };
    fs.writeFileSync(outputFile, JSON.stringify(reflexReport, null, 2));
    // 🎨 Colores dinámicos
    const color = reflexIndex >= 85
        ? "#00ff88"
        : reflexIndex >= 60
            ? "#ffe600"
            : "#ff4d4d";
    // 🧠 HTML Dashboard
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>OMEGA Reflex v15 Dashboard</title>
<style>
body {
  font-family: 'Segoe UI', sans-serif;
  background: #0c0c0c;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 40px;
}
h1 { color: ${color}; }
.card {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 20px 30px;
  margin: 15px;
  width: 80%;
  max-width: 700px;
  box-shadow: 0 0 12px rgba(255,255,255,0.08);
}
.circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: conic-gradient(${color} ${(reflexIndex / 100) * 360}deg, #333 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 20px auto;
  color: #fff;
  box-shadow: 0 0 25px ${color}80;
}
ul { line-height: 1.8; }
footer {
  margin-top: 40px;
  font-size: 0.9em;
  color: #888;
}
</style>
</head>
<body>
<h1>🧠 Omega Reflex v15 — Dashboard Cognitivo</h1>
<div class="card">
  <div class="circle">${reflexIndex}</div>
  <h2>Índice Cognitivo</h2>
  <p><strong>Coherencia:</strong> ${reflexReport.summary.coherence}</p>
  <p><strong>Evaluación:</strong> ${insight}</p>
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
  <h2>Recomendaciones</h2>
  <ul>
    ${reflexReport.recommendations.map((r) => `<li>${r}</li>`).join("")}
  </ul>
</div>

<footer>OMEGA Cognitive Core v15 • Generado ${new Date().toLocaleString()}</footer>
</body>
</html>`;
    fs.writeFileSync(htmlFile, html);
    console.log(`✅ Reflex v15 visual completado.`);
    console.log(`📘 JSON: ${outputFile}`);
    console.log(`🌐 HTML: ${htmlFile}`);
    console.log(`💡 Insight: ${insight}`);
}
catch (err) {
    console.error("❌ Error en Reflex v15:", err.message);
    process.exit(1);
}

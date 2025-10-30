// src/ai/autoDashboard.ts
// 🧠 Omega Cognitive Dashboard v10.3-B (Reflexión Cognitiva)
// Extiende el dashboard con una autoevaluación textual del sistema.
// No altera datos. Solo lee memorias y genera un HTML visual.
import fs from "fs";
import path from "path";
function safeLoadJSON(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        return null;
    }
    catch {
        return null;
    }
}
// 🧩 Nueva función: reflexión cognitiva automática
function generateSystemReflection(data) {
    if (!data)
        return "Sin datos suficientes para análisis cognitivo.";
    const sharpe = data.sharpe ?? 0;
    const mdd = data.mdd ?? 0;
    const tone = data.tone ?? "NEUTRAL";
    const balance = (data.balance ?? "NEUTRAL").toUpperCase();
    if (tone === "NEGATIVO" && sharpe < 0) {
        if (Math.abs(mdd) > 0.2)
            return "🧩 Estado Cognitivo: Fase de ajuste. El sistema detecta sesgo pesimista y recomienda reducción de sensibilidad o mayor regularización.";
        else
            return "🧠 Estado Cognitivo: Equilibrio inestable. Presenta desviación leve pero mantiene control sobre la robustez general.";
    }
    if (tone === "POSITIVO" && sharpe > 0.5)
        return "✨ Estado Cognitivo: Aprendizaje consolidado. El sistema muestra coherencia entre riesgo y rendimiento, listo para avanzar a nuevos escenarios.";
    if (balance === "NEUTRAL")
        return "⚖️ Estado Cognitivo: Equilibrio estable. Sin anomalías destacables.";
    return "🌀 Estado Cognitivo: Transición dinámica. El núcleo de aprendizaje está ajustando internamente sus pesos cognitivos.";
}
export function generateCognitiveDashboard() {
    const reportsDir = path.join(process.cwd(), "reports");
    // Archivos esperados
    const files = {
        symbiont: path.join(reportsDir, "memory_symbiont_v10.json"),
        tutor: path.join(reportsDir, "memory_tutor_v10.json"),
        auto: fs
            .readdirSync(reportsDir)
            .find((f) => f.startsWith("auto_optimized_v10_2_") && f.endsWith(".json")),
    };
    const symbiont = safeLoadJSON(files.symbiont);
    const tutor = safeLoadJSON(files.tutor);
    const auto = files.auto ? safeLoadJSON(path.join(reportsDir, files.auto)) : null;
    if (!symbiont || !tutor) {
        console.error("❌ Faltan memorias base (Symbiont o Tutor).");
        return;
    }
    const extract = (obj) => ({
        sharpe: obj?.summary?.sharpe ?? 0,
        mdd: obj?.summary?.mdd ?? 0,
        robustness: obj?.summary?.robustness ?? 0,
        balance: obj?.summary?.balance ?? "NEUTRAL",
        insight: obj?.insight?.insight ?? "",
        advice: obj?.insight?.advice ?? "",
        tone: obj?.insight?.tone ?? "NEUTRAL",
    });
    const s = extract(symbiont);
    const t = extract(tutor);
    const a = auto ? extract(auto) : null;
    // 🔍 Generamos la reflexión cognitiva final
    const reflection = generateSystemReflection(a ?? t);
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>OMEGA Cognitive Dashboard v10.3-B</title>
  <style>
    body { font-family: "Segoe UI", sans-serif; background: #0b0c10; color: #eee; padding: 30px; }
    h1, h2 { color: #00e0ff; }
    .card { background: #14161a; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 0 12px #00e0ff33; }
    .metric { font-size: 1.1em; margin: 4px 0; }
    .chart { width: 100%; height: 260px; margin-top: 10px; }
    .insight { color: #ffc107; font-style: italic; }
    .positive { color: #00ff99; }
    .negative { color: #ff6666; }
    footer { margin-top: 40px; color: #888; font-size: 0.9em; }
    .reflection { background: #1c1f25; padding: 20px; border-left: 5px solid #00e0ff; border-radius: 10px; font-size: 1.05em; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>🧠 OMEGA Cognitive Dashboard v10.3-B</h1>
  <p>Visualización integral de la evolución cognitiva y reflexión automática del sistema.</p>

  <div class="card">
    <h2>Resumen de Métricas</h2>
    <div class="metric">📘 Symbiont v10 → Sharpe: ${s.sharpe}, MDD: ${s.mdd}, Robustez: ${s.robustness}%</div>
    <div class="metric">🎓 Tutor v10.1 → Sharpe: ${t.sharpe}, MDD: ${t.mdd}, Robustez: ${t.robustness}%</div>
    ${a
        ? `<div class="metric">🔁 AutoLearn v10.2 → Sharpe: ${a.sharpe}, MDD: ${a.mdd}, Robustez: ${a.robustness}%</div>`
        : "<div class='metric'>🔁 AutoLearn v10.2 → No ejecutado aún</div>"}
  </div>

  <div class="card">
    <h2>Insights Cognitivos</h2>
    <p class="insight">💡 ${t.insight}</p>
    <p>${t.advice}</p>
    <p>Tono general: <strong class="${t.tone === "NEGATIVO" ? "negative" : "positive"}">${t.tone}</strong></p>
  </div>

  <div class="card">
    <h2>Evolución Visual</h2>
    <canvas id="chart" class="chart"></canvas>
  </div>

  <div class="card reflection">
    <h2>Reflexión del Sistema</h2>
    <p>${reflection}</p>
  </div>

  <footer>Generado automáticamente por Omega Learn v10.3-B — © ${new Date().getFullYear()} Cognitive Systems.</footer>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    const ctx = document.getElementById("chart").getContext("2d");
    const data = {
      labels: ["Symbiont v10", "Tutor v10.1", "AutoLearn v10.2"],
      datasets: [
        {
          label: "Sharpe",
          data: [${s.sharpe}, ${t.sharpe}, ${a?.sharpe ?? "null"}],
          borderColor: "#00e0ff",
          fill: false,
          tension: 0.3
        },
        {
          label: "MDD",
          data: [${s.mdd}, ${t.mdd}, ${a?.mdd ?? "null"}],
          borderColor: "#ff6666",
          fill: false,
          tension: 0.3
        },
        {
          label: "Robustez %",
          data: [${s.robustness}, ${t.robustness}, ${a?.robustness ?? "null"}],
          borderColor: "#00ff99",
          fill: false,
          tension: 0.3
        }
      ]
    };
    new Chart(ctx, {
      type: "line",
      data,
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { labels: { color: "#eee" } } }
      }
    });
  </script>
</body>
</html>
`;
    const outPath = path.join(reportsDir, "dashboard_auto_v10_3.html");
    fs.writeFileSync(outPath, html, "utf8");
    console.log(`✅ Dashboard v10.3-B generado correctamente en: ${outPath}`);
}

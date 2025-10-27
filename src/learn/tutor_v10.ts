// src/learn/tutor_v10.ts
// 🧠 OMEGA Learn v10.1 – Symbiont Tutor (Cognitive Explanation Layer)
// Lee memory_symbiont_v10.json y genera una explicación (consola + JSON + HTML)
// Compatible con v6–v10. No modifica archivos existentes: solo crea nuevos.

import fs from "fs";
import path from "path";

interface SymbiontMemory {
  version: string;
  summary: {
    sharpe: number;
    mdd: number;
    robustness: number;
    balance: string;
  };
  insight: {
    insight: string;
    explanation: string;
    advice: string;
    tone: string;
  };
}

function safeNum(x: any, digits = 4) {
  return typeof x === "number" && !Number.isNaN(x) ? x.toFixed(digits) : "N/A";
}

function safePct(x: any, digits = 2) {
  return typeof x === "number" && !Number.isNaN(x) ? `${x.toFixed(digits)}%` : "N/A";
}

function severityColor(balance: string) {
  if (balance === "POSITIVO") return "#16a34a"; // verde
  if (balance === "NEGATIVO") return "#dc2626"; // rojo
  return "#d97706"; // ámbar
}

function buildHtml(memory: SymbiontMemory, feedback: string) {
  const color = severityColor(memory.summary.balance);
  const css = `
  :root { --fg:#e5e7eb; --bg:#0b1020; --muted:#9ca3af; --card:#121a2e; --acc:${color}; }
  *{box-sizing:border-box} body{margin:0;background:radial-gradient(1200px 600px at 70% -10%, #0f172a 0%, var(--bg) 35%, #050816 100%);color:var(--fg);font:14px/1.4 ui-sans-serif,system-ui,Segoe UI,Roboto,Ubuntu}
  .wrap{max-width:980px;margin:48px auto;padding:0 16px}
  .title{font-weight:700;letter-spacing:.2px;margin:0 0 8px}
  .muted{color:var(--muted)}
  .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0 24px}
  .card{background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:14px}
  .metric{font-size:12px;color:var(--muted);margin:0 0 6px}
  .value{font-size:22px;font-weight:700;margin:0}
  .pill{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);padding:6px 10px;border-radius:999px}
  .pill .dot{width:8px;height:8px;border-radius:999px;background:var(--acc)}
  .panel{display:grid;grid-template-columns:1fr;gap:12px}
  pre{white-space:pre-wrap;background:var(--card);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,.06)}
  footer{margin-top:28px;font-size:12px;color:var(--muted)}
  @media(min-width:860px){ .panel{grid-template-columns:1fr 1fr} }
  `;
  const html = `<!doctype html>
<html lang="es">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>OMEGA Tutor v10.1 – Symbiont Advisor</title>
<style>${css}</style>
<body>
  <div class="wrap">
    <h1 class="title">OMEGA Tutor v10.1 <span class="muted">· Symbiont Advisor (Explainable)</span></h1>
    <div class="pill"><span class="dot"></span><span>Balance general: <b>${memory.summary.balance}</b></span></div>

    <div class="grid">
      <div class="card"><div class="metric">Sharpe</div><p class="value">${safeNum(memory.summary.sharpe)}</p></div>
      <div class="card"><div class="metric">MDD</div><p class="value">${safeNum(memory.summary.mdd)}</p></div>
      <div class="card"><div class="metric">Robustez</div><p class="value">${safePct(memory.summary.robustness)}</p></div>
      <div class="card"><div class="metric">Versión</div><p class="value">${memory.version}</p></div>
    </div>

    <div class="panel">
      <div class="card">
        <div class="metric">Insight</div>
        <p class="value" style="font-size:16px">${memory.insight.insight}</p>
      </div>
      <div class="card">
        <div class="metric">Sugerencia</div>
        <p class="value" style="font-size:16px">${memory.insight.advice}</p>
      </div>
    </div>

    <div class="card" style="margin-top:12px">
      <div class="metric">Explicación</div>
      <p class="value" style="font-size:16px;line-height:1.55">${memory.insight.explanation}</p>
    </div>

    <div class="card" style="margin-top:12px">
      <div class="metric">Salida del Tutor</div>
      <pre>${feedback.replace(/[<>&]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s] as string))}</pre>
    </div>

    <footer>Generado automáticamente por OMEGA Learn v10.1 – Capa de Tutoría Cognitiva Adaptativa.</footer>
  </div>
</body>
</html>`;
  return html;
}

export function runTutorV10() {
  console.log("🎓 Iniciando Tutor Cognitivo OMEGA v10.1...");

  const reportsDir = path.resolve("reports");
  const inputPath = path.join(reportsDir, "memory_symbiont_v10.json");
  const jsonOut = path.join(reportsDir, "memory_tutor_v10.json");
  const htmlOut = path.join(reportsDir, "dashboard_tutor_v10.html");

  if (!fs.existsSync(inputPath)) {
    throw new Error("No se encontró reports/memory_symbiont_v10.json. Ejecuta primero testMemoryV10.ts");
  }

  const memory: SymbiontMemory = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  const sharpe = safeNum(memory.summary.sharpe);
  const mdd = safeNum(memory.summary.mdd);
  const robustez = safePct(memory.summary.robustness);
  const balance = memory.summary.balance;

  const feedback = `
🧠 Versión del Tutor: v10.1 (Symbiont Advisor)
--------------------------------------------
🔹 Sharpe: ${sharpe}
🔹 MDD: ${mdd}
🔹 Robustez: ${robustez}
🔹 Balance general: ${balance}
🔹 Insight: ${memory.insight.insight}

🧩 Explicación:
${memory.insight.explanation}

💡 Sugerencia:
${memory.insight.advice}

--------------------------------------------
📘 Generado por OMEGA Learn v10.1 (Capa de Tutoría Cognitiva Adaptativa)
`.trim();

  console.log(feedback);

  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonOut, JSON.stringify({ ...memory, tutor: feedback }, null, 2), "utf8");
  fs.writeFileSync(htmlOut, buildHtml(memory, feedback), "utf8");

  console.log(`✅ Informe del Tutor guardado en: ${jsonOut}`);
  console.log(`✅ Dashboard HTML del Tutor guardado en: ${htmlOut}`);

  return memory;
}

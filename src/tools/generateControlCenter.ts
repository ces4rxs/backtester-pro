// src/tools/generateControlCenter.ts
// 🧠 Quantum Dashboard v1.8 – Control Center (No rompe compatibilidad)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const reportsDir = "./reports";
  const outputPath = path.join(reportsDir, "dashboard_quantum_v1.8.html");

  const dashboards = [
    { name: "Auditoría", file: "dashboard_quantum_v1.3.html", emoji: "📊" },
    { name: "Legal", file: "dashboard_quantum_v1.4.1.html", emoji: "⚖️" },
    { name: "Riesgo", file: "dashboard_quantum_v1.5.html", emoji: "🧠" },
    { name: "Correlación", file: "dashboard_quantum_v1.7.html", emoji: "🔗" },
  ];

  const linksHtml = dashboards
    .map(
      (d, i) => `
      <button class="nav-btn" onclick="loadSection('${d.file}', ${i})">
        ${d.emoji} ${d.name}
      </button>
    `
    )
    .join("\n");

  const html = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Quantum Dashboard Control Center v1.8</title>
    <style>
      body {
        margin: 0;
        display: flex;
        background-color: #0b0b0b;
        color: #fff;
        font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        overflow: hidden;
      }
      #sidebar {
        width: 260px;
        background: linear-gradient(180deg, #111 0%, #0a0a0a 100%);
        padding: 20px;
        border-right: 2px solid #00ffaa44;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .nav-btn {
        background: none;
        border: 1px solid #00ffaa55;
        color: #00ffaa;
        padding: 12px 14px;
        margin: 5px 0;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        font-size: 15px;
        transition: 0.2s;
      }
      .nav-btn:hover {
        background: #00ffaa22;
      }
      #main {
        flex: 1;
        padding: 0;
        overflow: hidden;
      }
      iframe {
        width: 100%;
        height: 100vh;
        border: none;
        background: #0b0b0b;
      }
      .footer {
        font-size: 12px;
        color: #666;
        text-align: center;
        padding-top: 10px;
      }
    </style>
  </head>
  <body>
    <div id="sidebar">
      <div>
        <h2 style="color:#00ffaa;text-align:center;">🧬 Quantum Control</h2>
        ${linksHtml}
      </div>
      <div class="footer">
        <p>Quantum Dashboard v1.8 © Julio César</p>
      </div>
    </div>
    <div id="main">
      <iframe id="viewer" src="./dashboard_quantum_v1.7.html"></iframe>
    </div>
    <script>
      function loadSection(file, index) {
        const viewer = document.getElementById("viewer");
        viewer.src = "./" + file;
      }
    </script>
  </body>
</html>`;

  fs.writeFileSync(outputPath, html, "utf8");
  console.log("✅ Dashboard Quantum Control Center v1.8 generado:", outputPath);
}

main().catch((err) => console.error("❌ Error generando Control Center:", err));

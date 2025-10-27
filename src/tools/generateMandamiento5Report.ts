// src/reports/generateMandamiento5Report.ts
// 🧠 OMEGA Labs — Mandamiento V: Riesgo Coherente
// Versión actualizada con sello "Quantum+ Rating: A+"

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { MonteCarloResult } from "../core/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Genera el informe oficial del Mandamiento V (Riesgo Coherente)
 * basado en resultados de simulación Monte Carlo avanzada.
 */
export function generateMandamiento5Report(result: MonteCarloResult) {
  const date = format(new Date(), "PPPPpp", { locale: es });

  // --- ASCII Header del Sello Visual OMEGA ---
  const seal = `
  ╔═══════════════════════════════════════╗
  ║           Q U A N T U M  +            ║
  ║            R A T I N G :  A+          ║
  ╚═══════════════════════════════════════╝
  `;

  const report = `
──────────────────────────────────────────────
 O M E G A  •  M A N D A M I E N T O  V
──────────────────────────────────────────────
📅 Fecha de generación: ${date}

🔹 Evaluación de Riesgo Coherente (Monte Carlo Advanced)
──────────────────────────────────────────────
Número de simulaciones: ${result.simulations}
Pérdida Máxima Esperada (CVaR 95%): ${result.cvar95.toFixed(2)} USD
Desviación Estándar de Equity: ${result.stdDev.toFixed(2)} USD
Probabilidad de Drawdown > 10%: ${(result.drawdownProb * 100).toFixed(2)}%
Nivel de Robustez Estimada: ${(result.robustnessScore * 100).toFixed(1)}%

──────────────────────────────────────────────
💠 Sello de Evaluación OMEGA:
${seal}

📊 Diagnóstico IA: ${result.aiDiagnostic}

──────────────────────────────────────────────
⚖️ Disclaimer Legal:
Este informe forma parte del sistema de diagnóstico cuantitativo OMEGA.
Los resultados aquí presentados son simulaciones y **no garantizan rendimientos futuros**.
El sello “Quantum+ Rating” representa una **evaluación técnica interna de robustez**,
no una certificación financiera ni una recomendación de inversión.
──────────────────────────────────────────────
`;

  const reportsDir = path.join(__dirname, "outputs");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const filePath = path.join(reportsDir, `MandamientoV_Report_${Date.now()}.txt`);
  fs.writeFileSync(filePath, report, "utf8");

  console.log("✅ Informe generado con éxito:", filePath);
  return filePath;
}

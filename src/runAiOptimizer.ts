// src/runAiOptimizer.ts
// 🧠 OMEGA – AI Optimizer Launcher (Nivel 4: Bucle de Estrategias)

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { runOptimizer } from "./ai/optimizer.js"; // ✅ función real exportada

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log("🚀 Iniciando OMEGA AI Optimizer (Nivel 4 – Bucle de Estrategias)");
  console.log("⚙️ Cargando módulo de optimización avanzada...");

  // Ejecuta el optimizador (ya controla internamente las combinaciones SMA)
  runOptimizer();

  // Esperamos un poco a que se genere el archivo de salida
  const RESULT_FILE = path.join(__dirname, "optimizer_results.json");
  const BEST_FILE = path.join(__dirname, "ai", "models", "best_strategy.json");

  // Espera unos segundos para leer los resultados (opcional)
  setTimeout(() => {
    if (fs.existsSync(RESULT_FILE)) {
      const data = JSON.parse(fs.readFileSync(RESULT_FILE, "utf8"));
      console.log(`\n✅ Se detectaron ${data.length} combinaciones optimizadas.`);
      console.log("🏆 Mejor resultado:");
      console.table(data[0]);
    }

    if (fs.existsSync(BEST_FILE)) {
      console.log(`\n🧠 Configuración óptima almacenada en: ${BEST_FILE}`);
    }

    console.log("💾 Optimización completada y resultados guardados ✅");
  }, 3000);
} catch (err) {
  console.error("\n❌ Error en el módulo OMEGA Optimizer:", err);
}

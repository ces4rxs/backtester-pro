// src/test/testOptimizerV5.ts
import { runAdaptiveOptimizer } from "../core_v5/optimizer_v5";
import { predictForCurrent } from "../ai/predictor_v4";
import fs from "fs";
import path from "path";
console.log("🧠 Probando OMEGA v5 (Adaptive Optimizer)...");
const goal = { metric: "sharpe", direction: "max" };
const prophetPredict = (x) => predictForCurrent();
(async () => {
    try {
        const base = {
            id: "demo-unnamed",
            name: "SMA(5,30)",
            params: { fast: 5, slow: 30 },
            metrics: { sharpe: 1.2, mdd: -0.03, cagr: 0.08 },
        };
        const report = await runAdaptiveOptimizer(base, goal, {
            prophetPredict,
            population: 20,
        });
        console.log("✅ Optimizer ejecutado correctamente");
        console.log(JSON.stringify(report, null, 2));
        // 💾 Guardar reporte automáticamente
        const outputPath = path.join(process.cwd(), "reports", "opt_v5_test.json");
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
        console.log(`💾 Reporte guardado en ${outputPath}`);
    }
    catch (err) {
        console.error("❌ Error en testOptimizerV5:", err);
    }
})();

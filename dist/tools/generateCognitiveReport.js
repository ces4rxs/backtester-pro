// src/tools/generateCognitiveReport.ts
// 🧠 OMEGA Cognitive Report Generator v14
// Fusiona resultados de Montecarlo v11/v12 y Cognitive Risk v14
// 🔒 Seguro, no altera rutas. Solo lecturas internas.
// Ejecutar con:  npm run dashboard:risk
import axios from "axios";
import fs from "fs";
import path from "path";
// ⚙️ Config local / Render-safe
const BASE_URL = process.env.BASE_URL || "http://localhost:4000";
const STRATEGY_ID = "demo"; // Puedes cambiarlo o parametrizarlo
async function fetchSafe(endpoint) {
    try {
        const { data } = await axios.get(`${BASE_URL}${endpoint}`);
        return data.result || data;
    }
    catch (err) {
        console.error(`❌ Error al consultar ${endpoint}:`, err?.message || err);
        return { error: err?.message || err };
    }
}
async function main() {
    console.log("🚀 Generando OMEGA Cognitive Report v14...");
    const start = Date.now();
    // 1️⃣ Llamadas concurrentes
    const [v11, v14, v12] = await Promise.all([
        fetchSafe(`/ai/learn/v11plus/${STRATEGY_ID}`),
        fetchSafe(`/ai/learn/v14/${STRATEGY_ID}`),
        fetchSafe(`/ai/learn/v12plus/${STRATEGY_ID}`),
    ]);
    // 2️⃣ Fusión cognitiva
    const report = {
        timestamp: new Date().toISOString(),
        strategyId: STRATEGY_ID,
        modules: {
            v11: { summary: v11.summary, ...v11 },
            v12: { narrative: v12.narrative, ...v12 },
            v14: { narrative: v14.narrative, risk: v14.risk, ...v14 },
        },
        composite: {
            riskLevel: v14?.risk?.level ?? "N/A",
            focusFactor: v12?.focusFactor ?? null,
            entropy: v11?.entropy ?? null,
            cognitiveScore: Number(((v12?.focusFactor ?? 0) * (v11?.entropy ?? 1) * (v14?.risk?.riskScore ?? 50)).toFixed(2)),
        },
    };
    // 3️⃣ Guardado seguro
    const reportsDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir))
        fs.mkdirSync(reportsDir, { recursive: true });
    const fileName = `cognitive_report_${Date.now()}.json`;
    const filePath = path.join(reportsDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    // 4️⃣ Log resumen profesional
    console.log("📘 [OMEGA Cognitive Report]");
    console.log(`🕒 ${report.timestamp}`);
    console.log(`🧩 Estrategia: ${STRATEGY_ID}`);
    console.log(`⚙️ Entropía (v11): ${v11?.entropy ?? "N/A"}`);
    console.log(`🎯 Focus (v12): ${v12?.focusFactor ?? "N/A"}`);
    console.log(`🛡️ Riesgo (v14): ${v14?.risk?.level ?? "N/A"} (${v14?.risk?.riskScore ?? "?"})`);
    console.log(`🧠 Cognitive Score: ${report.composite.cognitiveScore}`);
    console.log(`💾 Guardado en: ${filePath}`);
    console.log(`⏱️ Tiempo total: ${(Date.now() - start) / 1000}s`);
}
main().catch((err) => console.error("❌ Error general:", err));

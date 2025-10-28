// 🧠 OMEGA AI Lab – Cognitive Learner v8.1 (Temporal Adaptive Memory)
// Instituto de Análisis Cuantitativo Omega – Unidad de IA Cognitiva
// ----------------------------------------------------------------------
// Aprende patrones temporales entre la memoria consolidada (v6)
// y el feedback heurístico (v7), aplicando inferencias cognitivas
// y generando visualización para el Dashboard Quantum.
// ----------------------------------------------------------------------
import fs from "fs";
import path from "path";
// --- Configuración de rutas ---
const REPORTS_DIR = path.join(process.cwd(), "reports");
const V6_PATH = path.join(REPORTS_DIR, "memory_summary_v6.json");
const V7_PATH = path.join(REPORTS_DIR, "memory_feedback_v7.json");
const OUTPUT_PATH = path.join(REPORTS_DIR, "memory_adaptive_v8.json");
const CHART_PATH = path.join(REPORTS_DIR, "charts", "memory_trend_v8.json");
// --- Colores de consola ---
const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";
const reset = "\x1b[0m";
// --- Función segura para leer JSON ---
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`${yellow}⚠️ No se encontró:${reset} ${filePath}`);
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    catch {
        console.error(`${red}❌ Error al leer o parsear:${reset} ${filePath}`);
        return null;
    }
}
// --- Función principal ---
export function runCognitiveLearnerV8() {
    console.log(`\n${cyan}🧩 Iniciando OMEGA Cognitive Learner v8.1...${reset}`);
    console.log(`${yellow}🧠 Analizando patrones entre la memoria consolidada (v6) y el feedback (v7)...${reset}`);
    const v6 = readJSON(V6_PATH);
    const v7 = readJSON(V7_PATH);
    if (!v6 || !v7) {
        console.error(`${red}❌ No se pudieron cargar los reportes v6/v7 necesarios para el aprendizaje cognitivo.${reset}`);
        return;
    }
    // --- Datos base ---
    const sharpeV6 = v6.stats?.sharpeAvg ?? 0;
    const mddV6 = v6.stats?.mddAvg ?? 0;
    const robustV6 = v6.stats?.robustnessAvg ?? 0;
    const sharpeV7 = v7.summary?.sharpeMean ?? -1;
    const mddV7 = v7.summary?.mddMean ?? 0;
    const robustV7 = v7.summary?.robustnessMean ?? 0;
    // --- Aprendizaje adaptativo (ponderación temporal) ---
    const weightRecent = 0.65;
    const weightHistoric = 0.35;
    const adaptiveSharpe = sharpeV7 * weightRecent + sharpeV6 * weightHistoric;
    const adaptiveMDD = mddV7 * weightRecent + mddV6 * weightHistoric;
    const adaptiveRobust = robustV7 * weightRecent + robustV6 * weightHistoric;
    // --- Inferencia heurística de tendencia cognitiva ---
    let trendInference = "Equilibrada";
    if (adaptiveSharpe > 1.2 && adaptiveMDD < 0.05)
        trendInference = "Alcista Estable";
    else if (adaptiveSharpe < 0.5 && adaptiveMDD > 0.2)
        trendInference = "Bajista Inestable";
    else if (adaptiveRobust > 85)
        trendInference = "Alta Resiliencia";
    // --- Inferencia contextual (mini red simbólica) ---
    let insight = "Estabilidad cognitiva detectada.";
    if (adaptiveSharpe > 1 && adaptiveRobust > 80)
        insight = "Alta consistencia intertemporal.";
    else if (adaptiveSharpe < 0)
        insight = "Desviación negativa detectada. Ajuste recomendado.";
    else if (adaptiveMDD > 0.2)
        insight = "Riesgo operacional elevado.";
    // --- Resumen cognitivo ---
    const cognitiveSummary = {
        version: "v8.1",
        baseVersions: ["v6", "v7"],
        adaptiveMetrics: {
            sharpeAdaptive: adaptiveSharpe,
            mddAdaptive: adaptiveMDD,
            robustnessAdaptive: adaptiveRobust,
        },
        inference: trendInference,
        insight,
        timestamp: new Date().toISOString(),
    };
    // --- Metadatos de auditoría ---
    const metadata = {
        author: "OMEGA AI Core",
        validatedBy: "Symbiont Verifier v10",
        build: "8.1-stable",
        generatedAt: new Date().toISOString(),
    };
    // --- Guardar resultado principal ---
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ ...cognitiveSummary, metadata }, null, 2));
    console.log(`${green}✅ Cognitive Report generado en:${reset} ${OUTPUT_PATH}`);
    // --- Generar versión visual para Dashboard Quantum ---
    if (!fs.existsSync(path.dirname(CHART_PATH)))
        fs.mkdirSync(path.dirname(CHART_PATH), { recursive: true });
    fs.writeFileSync(CHART_PATH, JSON.stringify({
        sharpeAdaptive: adaptiveSharpe,
        mddAdaptive: adaptiveMDD,
        robustnessAdaptive: adaptiveRobust,
        inference: trendInference,
        insight,
        timestamp: new Date().toISOString(),
    }, null, 2));
    console.log(`${green}📊 Datos listos para visualización en dashboard Quantum.${reset}`);
    // --- Mensaje final ---
    console.log(`\n🧠 ${cyan}Resumen del Cognitive Learner v8.1:${reset}`);
    console.log(`   🔗 Basado en: v6 + v7`);
    console.log(`   📈 Sharpe Adaptativo: ${adaptiveSharpe.toFixed(4)}`);
    console.log(`   📉 MDD Adaptativo: ${adaptiveMDD.toFixed(4)}`);
    console.log(`   🧩 Robustez Adaptativa: ${adaptiveRobust.toFixed(2)}%`);
    console.log(`   💡 Inferencia Cognitiva: ${trendInference}`);
    console.log(`   🧠 Insight: ${insight}`);
    console.log(`   🕒 Generado: ${new Date().toISOString()}`);
    console.log(`\n${green}✅ Proceso del OMEGA Cognitive Learner v8.1 completado.${reset}\n`);
}

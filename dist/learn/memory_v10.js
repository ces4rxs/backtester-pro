// src/learn/memory_v10.ts
// 🧠 OMEGA v10 – Symbiont Neural Twin
// Une la capa cognitiva (v9) con interpretación en lenguaje natural para el Tutor IA.
// No reemplaza nada, solo LEE y genera nuevos insights simbióticos.
import fs from "fs";
import path from "path";
function r(pathParts) {
    return path.join(process.cwd(), ...pathParts);
}
function loadJSON(p) {
    try {
        if (!fs.existsSync(p))
            return null;
        const raw = fs.readFileSync(p, "utf8");
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export default function runMemoryV10() {
    console.log("🤖 Iniciando OMEGA Symbiont Neural Twin v10...");
    const reportsDir = r(["reports"]);
    if (!fs.existsSync(reportsDir))
        fs.mkdirSync(reportsDir, { recursive: true });
    const v9Path = r(["reports", "memory_adaptive_v9.json"]);
    const datasetPath = r(["reports", "memory_dataset_v9.json"]);
    const v9 = loadJSON(v9Path);
    if (!v9)
        throw new Error("No se encontró memory_adaptive_v9.json.");
    const sharpe = v9.sharpeAdaptive ?? 0;
    const mdd = v9.mddAdaptive ?? 0;
    const robustness = v9.robustnessAdaptive ?? 0;
    let tone = "NEUTRAL";
    let insight;
    if (sharpe > 0.8 && robustness > 70) {
        tone = "POSITIVO";
        insight = {
            insight: "Equilibrio cognitivo detectado.",
            explanation: "El sistema muestra una relación saludable entre riesgo y rendimiento. Los parámetros adaptativos responden adecuadamente.",
            advice: "Mantén los parámetros actuales y registra esta configuración como una versión estable del modelo.",
            tone,
        };
    }
    else if (sharpe < 0 && robustness > 60) {
        tone = "NEGATIVO";
        insight = {
            insight: "Desviación cognitiva leve detectada.",
            explanation: "La memoria simbiótica detecta un rendimiento negativo sostenido con una robustez estable. Indica posible sobreajuste en estrategias recientes.",
            advice: "Ejecuta un nuevo ciclo de optimización Monte Carlo y reduce la sensibilidad de los hiperparámetros.",
            tone,
        };
    }
    else if (robustness < 50) {
        tone = "NEGATIVO";
        insight = {
            insight: "Robustez insuficiente en la red cognitiva.",
            explanation: "El sistema presenta alta volatilidad en las métricas base, lo que sugiere fragilidad en la capacidad de generalización.",
            advice: "Reentrena las estrategias con un set de validación extendido o aplica regularización en el modelo de aprendizaje.",
            tone,
        };
    }
    else {
        tone = "NEUTRAL";
        insight = {
            insight: "Estado cognitivo neutro.",
            explanation: "El sistema se encuentra en balance dinámico, sin sesgos extremos en rendimiento o estabilidad.",
            advice: "Continúa observando la tendencia adaptativa antes de ajustar.",
            tone,
        };
    }
    const report = {
        version: "v10",
        base: ["v9", "v8.1"],
        generated: new Date().toISOString(),
        summary: {
            sharpe,
            mdd,
            robustness,
            balance: tone,
        },
        insight,
        meta: {
            source: "OMEGA Cognitive Core",
            compatibleWithTutor: true,
        },
    };
    const outPath = r(["reports", "memory_symbiont_v10.json"]);
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
    console.log("✅ Symbiont Neural Twin generado correctamente.");
    console.log(`📄 Guardado en: ${outPath}`);
    console.log(`💡 Insight: ${insight.insight}`);
    console.log(`🧭 Tono general: ${tone}`);
    console.log("Test completado correctamente.\n");
    return report;
}

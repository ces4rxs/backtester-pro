// src/learn/learner.ts — Heurísticas simples para consejos (nivel 2)
import { LearnMemory, LearnSample } from "./memoryStore";

export type Advice = {
  summary: string;
  details: string[];
};

export function generateAdvice(current: LearnSample, mem: LearnMemory): Advice {
  const tips: string[] = [];

  // Heurísticas muy simples y seguras:
  if (current.quantumRating !== undefined) {
    if (current.quantumRating < 4) {
      tips.push("Tu Quantum Rating es bajo. Considera reducir parámetros sensibles y aplicar validación cruzada temporal.");
    } else if (current.quantumRating < 7) {
      tips.push("Quantum Rating medio. Prueba filtros de volatilidad y stress tests con Monte Carlo.");
    } else {
      tips.push("Buen Quantum Rating. Mantén validación out-of-sample y prueba otros activos para robustez cruzada.");
    }
  }

  if (current.overfitRisk === "ALTO") {
    tips.push("Riesgo de sobreajuste ALTO. Reduce grados de libertad, regulariza reglas y usa walk-forward.");
  } else if (current.overfitRisk === "MEDIO") {
    tips.push("Riesgo de sobreajuste MEDIO. Añade penalizaciones a complejidad y evalúa CVaR.");
  } else if (current.overfitRisk === "BAJO") {
    tips.push("Riesgo de sobreajuste BAJO. Mantén controles y monitoreo en producción.");
  }

  if (mem.stats.ratingAvg && current.quantumRating !== undefined) {
    if (current.quantumRating < mem.stats.ratingAvg - 1) {
      tips.push(`Tu rating está por debajo del promedio (${mem.stats.ratingAvg.toFixed(2)}). Revisa la estabilidad del Sharpe y el MDD.`);
    }
  }
  if (mem.stats.robustnessAvg && current.robustnessProb !== undefined) {
    if (current.robustnessProb < mem.stats.robustnessAvg - 5) {
      tips.push(`Tu robustez está bajo el promedio (${mem.stats.robustnessAvg.toFixed(1)}%). Incrementa validaciones cruzadas y tests de ruido.`);
    }
  }

  if (tips.length === 0) {
    tips.push("Continúa validando en múltiples periodos y activos. Mantén control de riesgo (CVaR, MDD) y monitoreo en vivo.");
  }

  return {
    summary: "Consejos generados por Omega Learn (nivel 2)",
    details: tips
  };
}

// src/strategies/example.ts
import type { Strategy, Bar, Position } from "../core/types.js";

/**
 * Estrategia de ejemplo — compra si el cierre es mayor que la apertura,
 * vende si el cierre es menor. Perfecta para pruebas Monte Carlo (M#5)
 */
export const myStrategy: Strategy = {
  name: "Example Strategy (Baseline)",

  onBar(bar: Bar, i: number, position: Position | null) {
    // Compra si la vela es verde y no hay posición abierta
    if (bar.c > bar.o && !position) {
      return "buy";
    }

    // Vende si la vela es roja y hay posición abierta
    if (bar.c < bar.o && position) {
      return "sell";
    }

    // Si no hay señal clara, no hace nada
    return null;
  },
};

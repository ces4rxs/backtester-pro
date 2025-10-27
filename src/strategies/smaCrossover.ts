// src/strategies/smaCrossover.ts
import type { Bar, Strategy, Position } from "../core/types.js";

// Helper para calcular SMA (tomado de tu archivo)
const sma = (arr: number[], w: number, i: number) => {
  if (i + 1 < w) return NaN;
  let sum = 0;
  for (let k = i - w + 1; k <= i; k++) sum += arr[k];
  return sum / w;
};

export function smaCrossover(shortWin = 10, longWin = 50): Strategy {
  let s: number[] = [];
  let l: number[] = [];

  return {
    // 1. warmup() reemplaza a tu init()
    warmup(bars: Bar[]): void {
      const close = bars.map(b => b.c);
      s = close.map((_, i) => sma(close, shortWin, i));
      l = close.map((_, i) => sma(close, longWin, i));
    },

    // 2. onBar() reemplaza a tu next()
    onBar(bar: Bar, index: number, position: Position | null): "buy" | "sell" | null {
      const i = index; // Para mantener la lógica
      
      // Asegurarse de que tenemos datos (i-1)
      if (i < 1 || !Number.isFinite(s[i]) || !Number.isFinite(l[i]) || !Number.isFinite(s[i - 1]) || !Number.isFinite(l[i - 1])) {
        return null; // No hay datos suficientes
      }

      // Lógica de cruce (de tu archivo)
      const up = s[i - 1] < l[i - 1] && s[i] >= l[i];
      const dn = s[i - 1] > l[i - 1] && s[i] <= l[i];

      // Lógica de Eventos: "buy" solo si estamos fuera, "sell" solo si estamos dentro
      if (!position && up) {
        return 'buy';
      }
      if (position && dn) {
        return 'sell';
      }
      
      return null; // Mantener estado (hold)
    }
  };
}
// src/strategies/rsiMeanRevert.ts
import type { Bar, Strategy, Position } from "../core/types.js";

// Lógica de RSI (la copiamos de nuestra conversación anterior)
export function rsiMeanRevert(
  rsiPeriod = 14,
  overSold = 30,
  overBought = 70
): Strategy {
  const rsiValues: (number | null)[] = [];
  let avgGain = 0;
  let avgLoss = 0;

  function calculateRSI(bars: Bar[]): void {
    rsiValues.length = 0; avgGain = 0; avgLoss = 0;
    // 1. Llenar de nulls iniciales
    for (let i = 0; i < rsiPeriod; i++) rsiValues.push(null);

    // 2. Calcular la primera media de ganancias/pérdidas
    // (Asegurarse de no salirse del array si hay pocas barras)
    const firstLoopEnd = Math.min(rsiPeriod, bars.length - 1);
    for (let i = 1; i <= firstLoopEnd; i++) {
      // ESTA ES LA LÍNEA 16-18: Comprueba que bars[i] exista
      if (bars[i] && bars[i-1]) { 
        const change = bars[i].c - bars[i - 1].c;
        if (change > 0) avgGain += change; else avgLoss -= change;
      }
    }
    avgGain /= rsiPeriod; avgLoss /= rsiPeriod;

    // 3. Calcular el primer RSI
    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    rsiValues[rsiPeriod] = 100 - 100 / (1 + rs);

    // 4. Calcular el resto (Wilder's Smoothing)
    for (let i = rsiPeriod + 1; i < bars.length; i++) {
      if (bars[i] && bars[i-1]) { // Segunda comprobación
        const change = bars[i].c - bars[i - 1].c;
        const gain = change > 0 ? change : 0; const loss = change < 0 ? -change : 0;
        avgGain = (avgGain * (rsiPeriod - 1) + gain) / rsiPeriod;
        avgLoss = (avgLoss * (rsiPeriod - 1) + loss) / rsiPeriod;
        const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
        rsiValues.push(100 - 100 / (1 + rs));
      } else {
        rsiValues.push(rsiValues[rsiValues.length - 1] ?? 50); // Rellenar si faltan datos
      }
    }
  }

  return {
    warmup(bars: Bar[]): void { calculateRSI(bars); },
    onBar(bar: Bar, index: number, position: Position | null): "buy" | "sell" | null {
      const rsi = rsiValues[index];
      if (rsi === null) return null;
      if (!position && rsi < overSold) return "buy";
      if (position && rsi > overBought) return "sell";
      return null;
    },
  };
}
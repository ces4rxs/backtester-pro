// src/core/types.ts (Final Verified Version - Extended for Realism Quantum Execution)

// --- OMEGA: Import Money TYPE from the Ledger ---
import type { Money } from './ledger_v3.js';
// ---

export interface Bar {
  t: number;
  o: number | string; // Accept strings to prevent float pollution
  h: number | string;
  l: number | string;
  c: number | string;
  v: number | string;
}

// --- OMEGA: Position uses the 'Money' type from the Ledger ---
export interface Position {
  size: Money; // This is now Decimal
  entryPrice: Money; // This is now Decimal
}
// ---

export interface Strategy {
  name: string; // Add name for manifest
  warmup?: (bars: Bar[]) => void; // Make warmup optional as per your original type
  onBar: (bar: Bar, index: number, position: Position | null) => 'buy' | 'sell' | null;
}

// --- ENGINE OPTIONS (Base) ---
export interface EngineOptions {
  initialCash?: number;
  feeBps?: number;
  slippageBps?: number;
  seed?: number;
  validateData?: boolean;
  enableJournal?: boolean; // ← NUEVO
  journalDir?: string;     // ← NUEVO (por defecto ./reports)

  // 🔽 EXTENSIÓN: Realismo de Ejecución Cuántico (Backward Compatible)
  slippage?: SlippageConfig; // NUEVO campo opcional
}

// --- NUEVO BLOQUE: CONFIGURACIÓN DE SLIPPAGE AVANZADO ---
export type SlippageConfig = {
  /** Modo de cálculo: "fixed" (por defecto) o "dynamic" */
  mode?: "fixed" | "dynamic";
  /** Para modo fixed */
  fixedBps?: number; // ej: 5 = 0.05%
  /** Spread base del exchange (bps) — para modo dynamic */
  spreadBps?: number;
  /** Factor de liquidez (0..1, donde 1 = mercado muy líquido) */
  liquidityFactor?: number;
  /** Número de velas a considerar para volatilidad dinámica */
  volatilityLookback?: number;
  /** Impacto lineal del tamaño de orden (bps por unidad) */
  sizeImpactBps?: number;
  /** Límite inferior y superior de slippage dinámico */
  minBps?: number;
  maxBps?: number;
};

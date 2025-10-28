// src/core/types.ts (v3.18 - Quantum Realism Extended + Render Safe)
// 💠 Validado para compilación NodeNext + Render 2025

// --- OMEGA: Import Money TYPE from the Ledger ---
import type { Money } from "./ledger_v3.js";

// --- Base de datos de barras de mercado ---
export interface Bar {
  t: number;
  o: number | string;
  h: number | string;
  l: number | string;
  c: number | string;
  v: number | string;
}

// --- OMEGA: Position usa el tipo Money del Ledger ---
export interface Position {
  size: Money;       // Decimal
  entryPrice: Money; // Decimal
}

// --- Estrategia genérica ---
export interface Strategy {
  name: string;
  warmup?: (bars: Bar[]) => void;
  onBar: (bar: Bar, index: number, position: Position | null) => "buy" | "sell" | null;
  /** Parámetros opcionales para exportar (registrados en manifest.json) */
  params?: Record<string, any>;
}

// --- ENGINE OPTIONS (Base) ---
export interface EngineOptions {
  initialCash?: number;
  feeBps?: number;
  slippageBps?: number;
  seed?: number;
  validateData?: boolean;
  enableJournal?: boolean;
  journalDir?: string;
  slippage?: SlippageConfig;
}

// --- NUEVO BLOQUE: CONFIGURACIÓN DE SLIPPAGE AVANZADO ---
export type SlippageConfig = {
  /** Modo de cálculo: "fixed" (por defecto) o "dynamic" */
  mode?: "fixed" | "dynamic";
  fixedBps?: number;
  spreadBps?: number;
  liquidityFactor?: number;
  volatilityLookback?: number;
  sizeImpactBps?: number;
  minBps?: number;
  maxBps?: number;
};

// --- Registro de trade (extendido para auditoría y realismo) ---
export interface TradeRecord {
  type: "buy" | "sell";
  time: number | string;
  price: number;
  size: number;
  fee?: number;
  slippageBps?: number;  // ← Agregado: ya lo usas en engine.ts
}

// --- Estado extendido del Ledger ---
export interface LedgerState {
  cash: Money;
  pos: Money;
  avgPrice: Money;
}

// --- Formato de resultados de backtest ---
export interface BacktestResult {
  equityFinal: number;
  returnTotal: number;
  cagr: number;
  sharpe: number;
  mdd: number;
  trades: TradeRecord[];
  equitySeries: number[];
  runId: string;
  journalChecksum?: string;
}

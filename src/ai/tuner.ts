// src/ai/tuner.ts
import type { Bar } from "../core/types.js";

type IntSpace = { kind: "int"; min: number; max: number; step?: number };
type FloatSpace = { kind: "float"; min: number; max: number; step?: number };
export type Space = Record<string, IntSpace | FloatSpace>;
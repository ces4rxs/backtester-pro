import { randomUUID } from "crypto";
import type { StrategyManifest, Variant } from "../types.js";

export function generateMutations(base: StrategyManifest, count = 200): Variant[] {
  const variants: Variant[] = [];
  for (let i = 0; i < count; i++) {
    const params: Record<string, any> = { ...base.params };
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === "number") {
        const jitter = 1 + (Math.random() * 0.3 - 0.15); // ±15%
        params[k] = clampNumber(jitter * v);
      } else if (typeof v === "boolean") {
        if (Math.random() < 0.1) params[k] = !v;
      }
    }
    variants.push({ id: randomUUID(), name: `${base.name}-v5-${i}`, params });
  }
  return variants;
}

function clampNumber(x: number, min = 1e-9, max = 1e9) {
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

// src/core/rng.ts (v1.0 - Deterministic RNG)
import seedrandom from "seedrandom";

/**
 * Crea un generador determinístico a partir de una semilla (seed).
 * Si no se provee, se usa una semilla basada en timestamp, pero se retorna cuál se usó.
 */
export function createRNG(seed?: number | string) {
  const finalSeed = seed ?? Date.now().toString();
  const rng = seedrandom(finalSeed.toString());
  return { rng, seedUsed: finalSeed };
}

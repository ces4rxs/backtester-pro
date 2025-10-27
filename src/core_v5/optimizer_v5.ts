import { generateMutations } from "./search/mutator.js";
import { judgeVariants, type ProphetPredictFn } from "./judge/predictJudge.js";
import { computeParetoFront } from "./search/paretoFront.js";
import type { OptimizeGoal, StrategyManifest } from "./types.js";

export interface OptimizeReport {
  goal: OptimizeGoal;
  base: StrategyManifest;
  variants: number;
  frontier: Array<{
    id: string;
    name: string;
    params: Record<string, any>;
    judge: {
      compositeScore: number;
      predictedSharpe?: number;
      predictedMDD?: number;
      antiOverfit?: number;
    };
  }>;
  generatedAt: string;
}

export async function runAdaptiveOptimizer(
  base: StrategyManifest,
  goal: OptimizeGoal,
  opts: { prophetPredict: ProphetPredictFn; population?: number; }
): Promise<OptimizeReport> {
  const population = Math.max(10, Math.min(1000, opts.population ?? 200));
  const variants = generateMutations(base, population);
  const judged = await judgeVariants(variants, goal, opts.prophetPredict);
  const frontier = computeParetoFront(judged);

  return {
    goal,
    base,
    variants: population,
    frontier: frontier.map(f => ({
      id: f.id, name: f.name, params: f.params, judge: f.judge,
    })),
    generatedAt: new Date().toISOString(),
  };
}

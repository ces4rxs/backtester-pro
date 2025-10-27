import type { OptimizeGoal, Variant, JudgedVariant } from "../types.js";

export type ProphetPredictFn = (variant: {
  name: string;
  params: Record<string, any>;
}) => Promise<{
  predictedSharpe?: number;
  predictedMDD?: number;
  antiOverfit?: number;
}>;

export async function judgeVariants(
  variants: Variant[],
  goal: OptimizeGoal,
  prophetPredict: ProphetPredictFn
): Promise<JudgedVariant[]> {
  const out: JudgedVariant[] = [];
  for (const v of variants) {
    const p = await prophetPredict({ name: v.name, params: v.params });
    const composite = composeScore(p, goal);
    out.push({
      ...v,
      judge: {
        predictedSharpe: p.predictedSharpe,
        predictedMDD: p.predictedMDD,
        antiOverfit: p.antiOverfit,
        compositeScore: composite,
        meta: p as any,
      },
    });
  }
  return out;
}

function composeScore(
  p: { predictedSharpe?: number; predictedMDD?: number; antiOverfit?: number },
  goal: OptimizeGoal
): number {
  switch (goal.kind) {
    case "max_predictedSharpe": return safe(p.predictedSharpe);
    case "min_predictedMDD":    return -safe(p.predictedMDD);
    case "max_antiOverfit":     return safe(p.antiOverfit);
    case "custom":              return 0; // reservado v5.1
  }
}
function safe(x?: number) { return Number.isFinite(x!) ? (x as number) : 0; }

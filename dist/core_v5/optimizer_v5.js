import { generateMutations } from "./search/mutator.js";
import { judgeVariants } from "./judge/predictJudge.js";
import { computeParetoFront } from "./search/paretoFront.js";
export async function runAdaptiveOptimizer(base, goal, opts) {
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

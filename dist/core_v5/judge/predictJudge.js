export async function judgeVariants(variants, goal, prophetPredict) {
    const out = [];
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
                meta: p,
            },
        });
    }
    return out;
}
function composeScore(p, goal) {
    switch (goal.kind) {
        case "max_predictedSharpe": return safe(p.predictedSharpe);
        case "min_predictedMDD": return -safe(p.predictedMDD);
        case "max_antiOverfit": return safe(p.antiOverfit);
        case "custom": return 0; // reservado v5.1
    }
}
function safe(x) { return Number.isFinite(x) ? x : 0; }

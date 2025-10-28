export function computeParetoFront(cands) {
    if (cands.length === 0)
        return cands;
    const hasMetrics = cands.some(c => c.judge.predictedSharpe !== undefined || c.judge.predictedMDD !== undefined);
    if (!hasMetrics) {
        return [...cands].sort((a, b) => b.judge.compositeScore - a.judge.compositeScore).slice(0, 10);
    }
    const front = [];
    for (const c of cands) {
        let dominated = false;
        for (const f of cands) {
            if (dominates(f, c)) {
                dominated = true;
                break;
            }
        }
        if (!dominated)
            front.push(c);
    }
    return front.slice(0, 15);
}
function dominates(a, b) {
    const aSharpe = a.judge.predictedSharpe ?? -Infinity;
    const bSharpe = b.judge.predictedSharpe ?? -Infinity;
    const aMDD = a.judge.predictedMDD ?? Infinity;
    const bMDD = b.judge.predictedMDD ?? Infinity;
    const aAO = a.judge.antiOverfit ?? -Infinity;
    const bAO = b.judge.antiOverfit ?? -Infinity;
    const betterOrEqual = aSharpe >= bSharpe && aMDD <= bMDD && aAO >= bAO;
    const strictlyBetter = aSharpe > bSharpe || aMDD < bMDD || aAO > bAO;
    return betterOrEqual && strictlyBetter;
}

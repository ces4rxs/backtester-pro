// src/ai/userBrainprint.ts — OMEGA v10 (User Brainprint Store)
import fs from "fs";
import path from "path";
const BP_DIR = path.join(process.cwd(), "src", "ai", "brainprints");
if (!fs.existsSync(BP_DIR))
    fs.mkdirSync(BP_DIR, { recursive: true });
const fileFor = (strategyId) => path.join(BP_DIR, `${encodeURIComponent(strategyId)}.json`);
export function saveBrainprint(bp) {
    const f = fileFor(bp.strategyId || "unknown");
    const data = { ...bp, timestamp: new Date().toISOString() };
    fs.writeFileSync(f, JSON.stringify(data, null, 2));
    return data;
}
export function loadBrainprint(strategyId) {
    const f = fileFor(strategyId);
    if (!fs.existsSync(f))
        return null;
    return JSON.parse(fs.readFileSync(f, "utf8"));
}
export function listBrainprints() {
    const files = fs.readdirSync(BP_DIR).filter((x) => x.endsWith(".json"));
    return files.map((fn) => JSON.parse(fs.readFileSync(path.join(BP_DIR, fn), "utf8")));
}

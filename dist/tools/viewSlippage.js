// src/tools/viewSlippage.ts
import fs from "fs";
import path from "path";
const REPORT_DIR = path.resolve("./reports");
function listLatestJournal() {
    if (!fs.existsSync(REPORT_DIR))
        return null;
    const files = fs.readdirSync(REPORT_DIR)
        .filter(f => f.toLowerCase().includes("journal") && f.endsWith(".json"))
        .map(f => path.join(REPORT_DIR, f));
    if (files.length === 0)
        return null;
    files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    return files[0];
}
function histogram(values, bins = 10) {
    if (!values.length)
        return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const width = (max - min) || 1;
    const edges = Array.from({ length: bins + 1 }, (_, i) => min + (i * width) / bins);
    const counts = Array(bins).fill(0);
    for (const v of values) {
        let idx = Math.floor(((v - min) / width) * bins);
        if (idx < 0)
            idx = 0;
        if (idx >= bins)
            idx = bins - 1;
        counts[idx]++;
    }
    return { edges, counts, min, max };
}
function bar(n) {
    const len = Math.min(40, n);
    return "█".repeat(len);
}
function main() {
    const file = listLatestJournal();
    if (!file) {
        console.log("⚠️ No encontré journals en ./reports. Corre una simulación con enableJournal:true.");
        process.exit(0);
    }
    const raw = fs.readFileSync(file, "utf8");
    const j = JSON.parse(raw);
    const slips = (j.trades || [])
        .map(t => Number(t.slippageBps))
        .filter(x => Number.isFinite(x));
    console.log(`\n📒 Journal: ${path.basename(file)} | trades: ${j.trades?.length ?? 0}`);
    if (!slips.length) {
        console.log("⚠️ No hay 'slippageBps' en los trades. Asegúrate de haber agregado el campo en engine.ts (paso 1).");
        return;
    }
    const n = slips.length;
    const avg = slips.reduce((a, b) => a + b, 0) / n;
    const min = Math.min(...slips);
    const max = Math.max(...slips);
    const p = (k) => {
        const s = [...slips].sort((a, b) => a - b);
        const idx = Math.max(0, Math.min(n - 1, Math.round((k / 100) * (n - 1))));
        return s[idx];
    };
    console.log("\n=== SLIPPAGE (bps) — RESUMEN ===");
    console.table({
        Trades: n,
        Min: min.toFixed(2),
        P25: p(25).toFixed(2),
        P50: p(50).toFixed(2),
        P75: p(75).toFixed(2),
        Max: max.toFixed(2),
        Mean: avg.toFixed(2),
    });
    const { edges, counts } = histogram(slips, 12);
    console.log("\n=== HISTOGRAMA (bps) ===");
    for (let i = 0; i < counts.length; i++) {
        const a = edges[i].toFixed(2);
        const b = edges[i + 1].toFixed(2);
        const c = counts[i];
        console.log(`${a} – ${b}  | ${bar(c)} ${c}`);
    }
    // CSV para Excel/BI
    const csvPath = path.join(REPORT_DIR, "slippage_export.csv");
    const csv = ["time,side,slippageBps,price,size"]
        .concat((j.trades || []).map(t => [t.time, t.side, t.slippageBps ?? "", t.price ?? "", t.size ?? ""].join(",")))
        .join("\n");
    fs.writeFileSync(csvPath, csv, "utf8");
    console.log(`\n💾 Exportado CSV: ${csvPath}`);
}
main();

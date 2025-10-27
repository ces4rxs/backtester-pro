// src/core/journal.ts (v1.0 - Trade Ledger & Journal)
import fs from "fs";
import path from "path";
import crypto from "crypto";
function ensureDir(p) {
    if (!fs.existsSync(p))
        fs.mkdirSync(p, { recursive: true });
}
function stableStringify(obj) {
    const seen = new WeakSet();
    const sort = (x) => {
        if (x && typeof x === "object") {
            if (seen.has(x))
                return null;
            seen.add(x);
            if (Array.isArray(x))
                return x.map(sort);
            return Object.keys(x).sort().reduce((acc, k) => {
                acc[k] = sort(x[k]);
                return acc;
            }, {});
        }
        return x;
    };
    return JSON.stringify(sort(obj));
}
function hashRecord(rec) {
    const payload = stableStringify(rec);
    return crypto.createHash("sha256").update(payload).digest("hex");
}
export function startJournal(init) {
    const folder = init.dir ?? "./reports";
    ensureDir(folder);
    const base = path.join(folder, `${init.runId}_journal`);
    const jsonPath = `${base}.json`;
    const csvPath = `${base}.csv`;
    return {
        runId: init.runId,
        folder,
        jsonPath,
        csvPath,
        records: [],
        seq: 0,
    };
}
export function appendTrade(j, rec) {
    const seq = ++j.seq;
    const core = { ...rec, seq, runId: j.runId };
    const tradeId = hashRecord(core);
    const full = { ...core, tradeId };
    j.records.push(full);
}
export function finalizeJournal(j) {
    // 1) Guardar JSON
    const jsonPayload = { runId: j.runId, trades: j.records };
    fs.writeFileSync(j.jsonPath, JSON.stringify(jsonPayload, null, 2));
    // 2) Guardar CSV (columnas fijas)
    const headers = [
        "runId", "seq", "time", "side", "price", "size", "notional", "fee",
        "cashBefore", "cashAfter", "posBefore", "posAfter",
        "avgPriceBefore", "avgPriceAfter", "equityBefore", "equityAfter", "tradeId"
    ];
    const rows = j.records.map(r => [
        r.runId, r.seq, r.time, r.side, r.price, r.size, r.notional, r.fee,
        r.cashBefore, r.cashAfter, r.posBefore, r.posAfter,
        r.avgPriceBefore, r.avgPriceAfter, r.equityBefore, r.equityAfter, r.tradeId
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    fs.writeFileSync(j.csvPath, csv);
    // 3) Checksum del JSON (artefacto oficial del journal)
    const checksum = crypto.createHash("sha256").update(JSON.stringify(jsonPayload)).digest("hex");
    console.log(`🧾 Journal guardado:\n  JSON: ${j.jsonPath}\n  CSV : ${j.csvPath}\n  checksum: ${checksum}`);
    return { checksum };
}

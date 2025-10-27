// src/core/journal.ts (v1.0 - Trade Ledger & Journal)
import fs from "fs";
import path from "path";
import crypto from "crypto";

export type Side = "buy" | "sell";

export interface JournalInit {
  runId: string;
  dir?: string; // default ./reports
}

export interface TradeRecord {
  runId: string;
  seq: number;            // índice del trade en el run
  time: number | string;  // bar.t
  side: Side;
  price: number;          // usado para el fill
  size: number;
  notional: number;
  fee: number;            // total (fee+tax si aplica)
  // snapshot contable
  cashBefore: number;
  cashAfter: number;
  posBefore: string;      // como string para preservar precisión (Decimal.toString)
  posAfter: string;
  avgPriceBefore: number;
  avgPriceAfter: number;
  // mark-to-market
  equityBefore: number;
  equityAfter: number;
  // trazabilidad
  tradeId: string;        // hash del propio registro
}

export interface JournalHandle {
  runId: string;
  folder: string;
  jsonPath: string;
  csvPath: string;
  records: TradeRecord[];
  seq: number;
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function stableStringify(obj: any): string {
  const seen = new WeakSet();
  const sort = (x: any): any => {
    if (x && typeof x === "object") {
      if (seen.has(x)) return null;
      seen.add(x);
      if (Array.isArray(x)) return x.map(sort);
      return Object.keys(x).sort().reduce((acc: any, k) => {
        acc[k] = sort(x[k]);
        return acc;
      }, {});
    }
    return x;
  };
  return JSON.stringify(sort(obj));
}

function hashRecord(rec: Omit<TradeRecord, "tradeId">): string {
  const payload = stableStringify(rec);
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function startJournal(init: JournalInit): JournalHandle {
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

export function appendTrade(j: JournalHandle, rec: Omit<TradeRecord, "seq" | "tradeId">) {
  const seq = ++j.seq;
  const core: Omit<TradeRecord, "tradeId"> = { ...rec, seq, runId: j.runId };
  const tradeId = hashRecord(core);
  const full: TradeRecord = { ...core, tradeId };
  j.records.push(full);
}

export function finalizeJournal(j: JournalHandle): { checksum: string } {
  // 1) Guardar JSON
  const jsonPayload = { runId: j.runId, trades: j.records };
  fs.writeFileSync(j.jsonPath, JSON.stringify(jsonPayload, null, 2));

  // 2) Guardar CSV (columnas fijas)
  const headers = [
    "runId","seq","time","side","price","size","notional","fee",
    "cashBefore","cashAfter","posBefore","posAfter",
    "avgPriceBefore","avgPriceAfter","equityBefore","equityAfter","tradeId"
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

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Bar } from "../core/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseNumber(x: string) {
  const n = Number(x);
  if (Number.isNaN(n)) throw new Error(`Número inválido: ${x}`);
  return n;
}
function toMillis(t: string | number) {
  if (typeof t === "number") return t;
  const n = Number(t);
  if (!Number.isNaN(n) && n > 10000000000) return n; // ya ms
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) throw new Error(`Fecha inválida: ${t}`);
  return d.getTime();
}

function loadCSV(filePath: string): Bar[] {
  const raw = fs.readFileSync(filePath, "utf8").trim();
  const lines = raw.split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV vacío");
  const header = lines[0].toLowerCase().replace(/\s+/g, "");
  const required = ["t", "o", "h", "l", "c", "v"];
  const ok = required.every((k) => header.includes(k));
  if (!ok) throw new Error("CSV debe tener columnas: t,o,h,l,c,v");

  return lines.slice(1).filter(Boolean).map((line) => {
    const [t, o, h, l, c, v] = line.split(",").map((s) => s.trim());
    return {
      t: toMillis(t),
      o: parseNumber(o),
      h: parseNumber(h),
      l: parseNumber(l),
      c: parseNumber(c),
      v: parseNumber(v),
    } as Bar;
  });
}

function loadJSON(filePath: string): Bar[] {
  const arr = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(arr)) throw new Error("JSON debe ser un array de velas");
  return arr.map((b: any) => ({
    t: toMillis(b.t),
    o: Number(b.o),
    h: Number(b.h),
    l: Number(b.l),
    c: Number(b.c),
    v: Number(b.v),
  })) as Bar[];
}

/** Carga barras desde ruta relativa a la raíz del proyecto o absoluta. Soporta .json y .csv */
export function loadBars(relOrAbsPath: string): Bar[] {
  const p = path.isAbsolute(relOrAbsPath)
    ? relOrAbsPath
    : path.join(process.cwd(), relOrAbsPath);
  if (!fs.existsSync(p)) throw new Error(`No existe archivo: ${p}`);
  const ext = path.extname(p).toLowerCase();
  if (ext === ".csv") return loadCSV(p);
  if (ext === ".json") return loadJSON(p);
  throw new Error("Formato no soportado. Usa .csv o .json");
}

// src/tools/genSyntheticTrend.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const N = 300; // número de velas
const data: any[] = [];

let price = 10000;
for (let i = 0; i < N; i++) {
  // tendencia suave + ruido
  const drift = Math.sin(i / 30) * 100 + (i * 0.5);
  const noise = (Math.random() - 0.5) * 100;
  price = Math.max(1000, price + drift + noise);

  const bar = {
    t: Date.now() + i * 86400000,
    o: price - 30,
    h: price + 50,
    l: price - 60,
    c: price,
    v: Math.round(Math.random() * 1000 + 500),
  };
  data.push(bar);
}

const filePath = path.join(__dirname, "../data/sample_btc_usd_1d.json");
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log(`✅ Nuevo dataset con tendencia generado: ${filePath}`);
console.log(`📊 Total de velas: ${data.length}`);

// verifyAudit.ts (v1.0 - Verificador Institucional OMEGA)
import fs from "fs";
import path from "path";
import { loadManifest, verifyManifestSeal } from "./src/core/manifest.js";

console.log("🔍 Iniciando verificación integral OMEGA...\n");

const reportsDir = "./reports";
if (!fs.existsSync(reportsDir)) {
  console.error("❌ No existe la carpeta 'reports'. Ejecuta un backtest primero.");
  process.exit(1);
}

const manifests = fs.readdirSync(reportsDir)
  .filter(f => f.endsWith("_manifest.json"))
  .sort((a, b) => fs.statSync(path.join(reportsDir, b)).mtimeMs - fs.statSync(path.join(reportsDir, a)).mtimeMs);

if (manifests.length === 0) {
  console.error("❌ No se encontraron manifests para verificar.");
  process.exit(1);
}

const latest = manifests[0];
const manifestPath = path.join(reportsDir, latest);
console.log(`📄 Manifest más reciente encontrado:\n${manifestPath}\n`);

const manifest = loadManifest(manifestPath);

// 1️⃣ Verificar sello digital
const sealOK = verifyManifestSeal(manifest);
console.log(sealOK
  ? "✅ DigitalSeal verificado correctamente (integridad confirmada)."
  : "❌ Fallo en la verificación del DigitalSeal (el archivo fue modificado).");

// 2️⃣ Verificar existencia del Journal
const journalJSON = manifest.runId ? `${reportsDir}/${manifest.runId}_journal.json` : null;
const journalCSV = manifest.runId ? `${reportsDir}/${manifest.runId}_journal.csv` : null;
const journalExists = journalJSON && fs.existsSync(journalJSON) && fs.existsSync(journalCSV);

if (journalExists) {
  console.log("✅ Journal encontrado y completo.");
  console.log(`   JSON: ${journalJSON}`);
  console.log(`   CSV : ${journalCSV}`);
} else {
  console.warn("⚠️ No se encontró Journal asociado a este manifest.");
}

// 3️⃣ Mostrar resumen tabular
console.log("\n📊 Resumen del manifest:");
console.table({
  "Versión Engine": manifest.engineVersion,
  "Estrategia": manifest.strategy,
  "Semilla": manifest.seed,
  "Checksum Dataset": manifest.data.checksum,
  "Checksum Journal": manifest.artifacts?.journalChecksum ?? "N/A",
  "Trades": manifest.metrics.tradesCount,
  "Equity Final": manifest.metrics.equityFinal,
  "Sharpe": manifest.metrics.sharpe,
  "MDD": manifest.metrics.mdd
});

console.log("\n🔒 Estado final:");
if (sealOK && journalExists) {
  console.log("✅ OMEGA AUDIT COMPLETA — Manifest y Journal íntegros.\n");
  process.exit(0);
} else if (sealOK) {
  console.log("⚠️ OMEGA AUDIT PARCIAL — Manifest íntegro, falta Journal.\n");
  process.exit(0);
} else {
  console.log("❌ OMEGA AUDIT FALLIDA — Alteración detectada.\n");
  process.exit(1);
}

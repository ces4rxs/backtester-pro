// verifySeal.ts (verifica el Digital Seal del último manifest)
import fs from "fs";
import path from "path";
import { loadManifest, verifyManifestSeal } from "./src/core/manifest.js";

function getLastManifestFile(): string {
  const dir = "./reports";
  if (!fs.existsSync(dir)) throw new Error("No existe la carpeta ./reports");
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith("_manifest.json"))
    .sort((a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs);
  if (files.length === 0) throw new Error("No hay manifests para verificar");
  return path.join(dir, files[0]);
}

(async () => {
  try {
    const manifestPath = getLastManifestFile();
    console.log(`🔎 Verificando manifest más reciente:\n${manifestPath}`);
    const manifest = loadManifest(manifestPath);

    const valid = verifyManifestSeal(manifest);
    if (valid) {
      console.log("✅ DigitalSeal verificado correctamente. El manifest no ha sido modificado.");
    } else {
      console.log("❌ DigitalSeal inválido: el manifest fue modificado o está corrupto.");
    }
  } catch (err) {
    console.error("⚠️ Error al verificar:", err);
  }
})();

// runTestDecimal.ts (v3.13-ready, con Replay)
import { runBacktest } from './src/core/engine.js';
import { runBacktestReplay } from './src/core/replay.js'; // ✅ Replay
const testStrategy = {
    name: "OmegaDecimalTest",
    warmup: (bars) => { },
    onBar: (bar, index, position) => {
        if (index === 1 && !position)
            return 'buy';
        if (index === 2 && position)
            return 'sell';
        return null;
    }
};
// Datos como strings (evita contaminación float)
const testBars = [
    { t: 0, o: '100', h: '100', l: '100', c: '100', v: '1000' },
    { t: 1, o: '100.1', h: '100.1', l: '100.1', c: '100.1', v: '1000' },
    { t: 2, o: '100.2', h: '100.2', l: '100.2', c: '100.2', v: '1000' },
    { t: 3, o: '100.3', h: '100.3', l: '100.3', c: '100.3', v: '1000' },
];
const testOptions = {
    initialCash: 10000,
    feeBps: 1,
    slippageBps: 0,
    seed: 1761027337991, // ✅ determinismo total
    validateData: true, // ✅ activa DataGuard
    enableJournal: true,
    journalDir: "./reports",
};
console.log("--- [INICIANDO PRUEBA DE PRECISIÓN OMEGA v6 (CON LEDGER)] ---");
const report = runBacktest(testBars, testStrategy, testOptions);
console.log("\n--- [REPORTE FINAL] ---");
console.log(JSON.stringify(report, null, 2));
// --- CÁLCULO DE ORO (LEDGER) ---
const expectedEquity = 10007.98901;
// --- FIN CÁLCULO ---
console.log("\n--- [VERIFICACIÓN] ---");
console.log(`El 'equityFinal' (OMEGA + Ledger) debería ser: ${expectedEquity}`);
console.log("Tu resultado:", report.equityFinal);
if (report.equityFinal === expectedEquity) {
    console.log("✅ ¡¡¡ÉXITO!!! El Ledger OMEGA está perfectamente integrado.");
}
else {
    console.log("❌ FALLO. El resultado no coincide con el cálculo del Ledger.");
}
// --- 🧩 REPLAY (opcional, audita bit a bit el manifest recién generado) ---
(async () => {
    const manifestPath = `./reports/${report.runId}_manifest.json`;
    const replay = await runBacktestReplay(manifestPath, testBars, testStrategy, { strict: true });
    if (replay.ok) {
        console.log("✅ REPLAY OK — resultado idéntico al manifest.");
    }
})();

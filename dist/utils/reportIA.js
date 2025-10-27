// src/utils/reportIA.ts
import fs from "fs";
import path from "path";
export function saveCompareReport(results, winner) {
    const reportDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(reportDir))
        fs.mkdirSync(reportDir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(reportDir, `compare_report_${timestamp}.json`);
    const summary = {
        timestamp: new Date().toLocaleString(),
        winner: winner.name,
        winnerStats: winner,
        results,
    };
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
    console.log(`\n💾 Reporte IA guardado en: ${reportPath}`);
}

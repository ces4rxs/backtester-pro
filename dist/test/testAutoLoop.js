// src/test/testAutoLoop.ts
import { runAutoLoopV10 } from "../ai/autoLoop.js";
console.log("🚀 Ejecutando test del Auto-Learn v10.2...");
runAutoLoopV10()
    .then(() => console.log("✅ Auto-Learn completado correctamente."))
    .catch(err => console.error("❌ Error:", err.message));

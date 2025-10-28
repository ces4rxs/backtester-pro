// src/core/decimal.ts — 🧮 OMEGA Decimal Quantum Precision (NodeNext Final Fix)
// Compatible con Decimal.js-Light v10+, Engine v3.18 y Ledger v3.1
import DecimalJS from "decimal.js-light";
// 🧠 Configuración global (precisión cuántica, redondeo mitad-par)
;
DecimalJS.set({
    precision: 34,
    rounding: DecimalJS.ROUND_HALF_EVEN,
});
// ✅ Constructor seguro
export const D = (x) => new DecimalJS(x);
// ✅ Export alias universal
export const Decimal = DecimalJS;
// ✅ Precisión estándar del sistema OMEGA
export const DP = {
    price: 8,
    size: 8,
    money: 8,
};

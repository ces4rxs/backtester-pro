// src/core/data.guard.ts (v1.0 - Data Integrity & Traceability Guard)
import crypto from "crypto";
function isFiniteNumberLike(x) {
    if (typeof x === "number")
        return Number.isFinite(x);
    if (typeof x === "string") {
        if (x.trim() === "")
            return false;
        const n = Number(x);
        return Number.isFinite(n);
    }
    return false;
}
function toNumber(x) {
    return typeof x === "number" ? x : Number(x);
}
/** Normaliza un bar mínimo… sin mutar el original */
function normalizeBar(bar) {
    return {
        t: bar?.t,
        o: bar?.o,
        h: bar?.h,
        l: bar?.l,
        c: bar?.c,
        v: bar?.v,
    };
}
export function computeBarsChecksum(bars) {
    // Para robustez, usa los bars "normalizados"
    const payload = JSON.stringify(bars.map(normalizeBar));
    return crypto.createHash("sha256").update(payload).digest("hex");
}
/**
 * Valida integridad básica de un array de bars.
 * No modifica los datos originales.
 */
export function validateBars(bars, opts = {}) {
    const strict = opts.strict ?? false;
    const expectSorted = opts.expectSorted ?? true;
    const allowEqual = opts.allowEqualTimestamps ?? false;
    const maxGap = opts.maxGap ?? null;
    const errors = [];
    const warnings = [];
    if (!Array.isArray(bars) || bars.length === 0) {
        errors.push({
            type: "error",
            code: "EMPTY_DATASET",
            message: "El dataset de barras está vacío o no es un array.",
        });
        const checksum = computeBarsChecksum(bars ?? []);
        return {
            ok: false,
            errors,
            warnings,
            stats: { count: 0, tMin: null, tMax: null, sorted: true, duplicates: 0, gapsDetected: 0 },
            checksum,
        };
    }
    // Validación de schema y tipos convertibles
    for (let i = 0; i < bars.length; i++) {
        const b = bars[i];
        const nb = normalizeBar(b);
        // Campos requeridos
        for (const key of ["t", "o", "h", "l", "c", "v"]) {
            if (!(key in nb)) {
                errors.push({
                    index: i,
                    type: "error",
                    code: "MISSING_FIELD",
                    message: `Falta el campo '${key}' en el bar`,
                });
            }
        }
        // Tipos numéricos convertibles
        if (!Number.isFinite(nb.t)) {
            if (!isFiniteNumberLike(nb.t)) {
                errors.push({
                    index: i,
                    type: "error",
                    code: "BAD_T",
                    message: `El campo 't' no es número finito ni convertible`,
                    detail: { t: nb.t },
                });
            }
        }
        for (const key of ["o", "h", "l", "c", "v"]) {
            if (!isFiniteNumberLike(nb[key])) {
                errors.push({
                    index: i,
                    type: "error",
                    code: "BAD_NUMERIC",
                    message: `El campo '${key}' no es número finito ni convertible`,
                    detail: { [key]: nb[key] },
                });
            }
        }
    }
    // Si ya hay errores críticos, corta (respeta strict luego)
    // Aun así computamos checksum y stats básicas
    const tVals = bars.map(b => toNumber(b?.t));
    const count = bars.length;
    const tMin = Math.min(...tVals);
    const tMax = Math.max(...tVals);
    // Orden y duplicados
    let sorted = true;
    let duplicates = 0;
    let gapsDetected = 0;
    for (let i = 1; i < bars.length; i++) {
        const tPrev = toNumber(bars[i - 1]?.t);
        const tCurr = toNumber(bars[i]?.t);
        if (tCurr < tPrev) {
            sorted = false;
            if (expectSorted) {
                errors.push({
                    index: i,
                    type: "error",
                    code: "UNSORTED",
                    message: `Serie no está ordenada por 't' ascendente: t[${i - 1}]=${tPrev} > t[${i}]=${tCurr}`,
                });
            }
            else {
                warnings.push({
                    index: i,
                    type: "warning",
                    code: "UNSORTED_WARN",
                    message: `Serie no ordenada por 't'`,
                });
            }
        }
        if (tCurr === tPrev) {
            duplicates++;
            if (!allowEqual) {
                warnings.push({
                    index: i,
                    type: "warning",
                    code: "DUPLICATE_T",
                    message: `Timestamp repetido en índices ${i - 1} y ${i} (t=${tCurr})`,
                });
            }
        }
        if (maxGap != null) {
            const gap = tCurr - tPrev;
            if (gap > maxGap) {
                gapsDetected++;
                warnings.push({
                    index: i,
                    type: "warning",
                    code: "TIME_GAP",
                    message: `Gap detectado entre t=${tPrev} y t=${tCurr} (gap=${gap} > maxGap=${maxGap})`,
                });
            }
        }
    }
    const checksum = computeBarsChecksum(bars);
    const ok = errors.length === 0;
    if (!ok && strict) {
        // Lanza error con resumen mínimo
        const summary = errors.slice(0, 5).map(e => `${e.code}@${e.index}: ${e.message}`).join(" | ");
        throw new Error(`DataGuard: falló la validación de barras. ${summary}${errors.length > 5 ? " …" : ""}`);
    }
    return {
        ok,
        errors,
        warnings,
        stats: { count, tMin, tMax, sorted, duplicates, gapsDetected },
        checksum,
    };
}

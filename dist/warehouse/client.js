// src/warehouse/client.ts — 💾 Prisma Dual Compatible (Render + Local)
import { PrismaClient } from "@prisma/client";
// 🧠 Singleton para asegurar una sola conexión
const prisma = globalThis.__prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "info", "warn", "error"]
            : ["error"],
    });
// ======================================================
// ⚙️ Evita intentar conectar si no existe DATABASE_URL
// ======================================================
if (process.env.DATABASE_URL) {
    prisma
        .$connect()
        .then(() => console.log("🟢 Prisma conectado correctamente"))
        .catch((err) => console.warn("⚠️ Prisma no se pudo conectar:", err));
}
else {
    console.warn("⚠️ Prisma deshabilitado (sin DATABASE_URL en entorno local)");
}
// Evita duplicar en desarrollo
if (process.env.NODE_ENV === "development")
    globalThis.__prisma = prisma;
// ======================================================
// ✅ Exportaciones únicas y seguras
// ======================================================
export const warehouse = prisma; // alias principal (usado en tus rutas)
export default prisma;

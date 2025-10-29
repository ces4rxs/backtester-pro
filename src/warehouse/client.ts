// src/warehouse/client.ts — 💾 Prisma Dual Compatible (Render + Local)
import { PrismaClient } from "@prisma/client";

declare global {
  // Evita múltiples instancias en hot reload (dev)
  var __prisma: PrismaClient | undefined;
}

// 🧠 Singleton para asegurar una sola conexión
const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

// ✅ Conexión local (Render ignora esto)
if (process.env.NODE_ENV === "development") {
  prisma
    .$connect()
    .then(() => console.log("🟢 Prisma conectado correctamente (modo local)"))
    .catch((err) => console.warn("⚠️ Prisma no se pudo conectar:", err));
}

// Evita duplicar en desarrollo
if (process.env.NODE_ENV === "development") globalThis.__prisma = prisma;

// ======================================================
// ✅ Exportaciones únicas y seguras
// ======================================================
export const warehouse = prisma; // alias principal (usado en tus rutas)
export default prisma;

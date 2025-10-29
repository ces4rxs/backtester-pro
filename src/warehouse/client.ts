// src/warehouse/client.ts — 💾 Prisma dual mode (Render + Local)
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

// 🔒 Función segura de inicialización (sin top-level await)
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

  if (process.env.NODE_ENV === "development") {
    client
      .$connect()
      .then(() => console.log("🟢 Prisma conectado correctamente (modo local)"))
      .catch((err) =>
        console.warn("⚠️ Prisma no se pudo conectar (Render no afectado):", err)
      );
  }

  return client;
}

try {
  prisma = createPrismaClient();
} catch (err) {
  console.error("❌ Prisma no se pudo inicializar correctamente:", err);
  prisma = {} as PrismaClient;
}

// ======================================================
// ✅ Exportaciones duales (Render + Local)
// ======================================================
export const warehouse: PrismaClient = prisma;
export const prismaClient: PrismaClient = prisma;
export const prisma = prisma; // <-- Render lo necesita así
export default prisma;

// src/warehouse/client.ts — 💾 Prisma dual mode (local + Render)
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

try {
  prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

  if (process.env.NODE_ENV === "development") {
    await prisma.$connect();
    console.log("🟢 Prisma conectado correctamente (modo local)");
  }
} catch (err) {
  console.error("❌ Prisma no se pudo inicializar correctamente:", err);
  prisma = {} as PrismaClient;
}

// ✅ Exportaciones duales
export const warehouse: PrismaClient = prisma; // alias principal
export const prismaClient: PrismaClient = prisma; // alias técnico
export default prisma; // compatibilidad con import prisma from ...

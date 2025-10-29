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

  // 🔹 Solo probamos conexión local (no afecta Render)
  if (process.env.NODE_ENV === "development") {
    await prisma.$connect();
    console.log("🟢 Prisma conectado correctamente (modo local)");
  }
} catch (err) {
  console.error("❌ Prisma no se pudo inicializar correctamente:", err);
  console.warn("⚠️ Ejecuta 'npx prisma generate' o revisa el schema.");
  // fallback para evitar crash
  prisma = {} as PrismaClient;
}

// 🔹 Exporta con nombre fijo
export const warehouse = prisma;

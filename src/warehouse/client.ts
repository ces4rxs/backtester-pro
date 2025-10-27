// src/warehouse/client.ts
import { PrismaClient } from "../../prisma/generated/warehouse";

export const warehouse = new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? ["query", "info", "warn", "error"]
    : ["error"],
});

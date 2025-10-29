// routes/server_strategies.ts — 🔒 SAFE PATCH OMEGA StrategyLabs v1-C
import express from "express";
import warehouse from "../warehouse/client.js"; // ✅ nota el .js aquí

const router = express.Router();

// ✅ Middleware simple de autenticación reutilizable
router.use((req, res, next) => {
  const userId = req.headers["x-user-id"] || req.body.userId;
  if (!userId) {
    return res.status(401).json({ ok: false, error: "Usuario no autenticado" });
  }
  (req as any).userId = Number(userId);
  next();
});

// =====================================================
// 1️⃣ Crear nueva estrategia
// =====================================================
router.post("/", async (req, res) => {
  try {
    const { name, symbol, timeframe, parameters, riskProfile } = req.body;
    const userId = (req as any).userId;

    const strategy = await warehouse.strategy.create({
      data: {
        userId,
        name,
        symbol,
        timeframe,
        parameters: parameters || {},
        riskProfile: riskProfile || "Neutro",
      },
    });

    res.json({ ok: true, strategy });
  } catch (err: any) {
    console.error("❌ [StrategyLabs] Error al crear estrategia:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =====================================================
// 2️⃣ Listar estrategias del usuario
// =====================================================
router.get("/mine", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const strategies = await warehouse.strategy.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ ok: true, strategies });
  } catch (err: any) {
    console.error("❌ [StrategyLabs] Error al listar estrategias:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =====================================================
// 3️⃣ Eliminar estrategia
// =====================================================
router.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);

    const strategy = await warehouse.strategy.findFirst({
      where: { id, userId },
    });
    if (!strategy)
      return res.status(404).json({ ok: false, error: "Estrategia no encontrada" });

    await warehouse.strategy.delete({ where: { id } });
    res.json({ ok: true, message: "Estrategia eliminada correctamente" });
  } catch (err: any) {
    console.error("❌ [StrategyLabs] Error al eliminar:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/ai/status", (_req, res) => {
    res.json({
        ok: true,
        status: "🧠 Omega AI Server render build test ok",
        version: "v4.3.2",
        timestamp: new Date().toISOString(),
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Servidor de prueba local corriendo en puerto ${PORT}`);
});

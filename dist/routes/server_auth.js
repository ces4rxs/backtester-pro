// src/routes/server_auth.ts
import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
const router = express.Router();
router.use(bodyParser.json());
router.use(cors({ origin: "*", methods: ["POST", "GET"] }));
// ⚠️ Solo para pruebas locales — reemplazar por dotenv en producción
const SECRET = "omega_secret_demo";
const users = [];
let idCounter = 1;
// 🧩 Registro
router.post("/register", (req, res) => {
    const { email, password } = req.body;
    if (users.find((u) => u.email === email)) {
        return res.status(400).json({ message: "El usuario ya existe" });
    }
    const user = { id: idCounter++, email, password };
    users.push(user);
    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "2h" });
    res.json({ user, accessToken });
});
// 🔐 Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user)
        return res.status(401).json({ message: "Credenciales inválidas" });
    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "2h" });
    res.json({ user, accessToken });
});
// 👤 Usuario actual
router.get("/me", (req, res) => {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ message: "Falta token" });
    const token = auth.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        const user = users.find((u) => u.id === decoded.id);
        if (!user)
            throw new Error();
        res.json(user);
    }
    catch {
        res.status(401).json({ message: "Token inválido o expirado" });
    }
});
export default router;

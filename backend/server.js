require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Rutas
const authRoutes = require("./src/routes/auth.routes");
const likeRoutes = require("./src/routes/likes.routes");
const matchRoutes = require("./src/routes/matches.routes");

// Base de datos (pool de PostgreSQL)
const pool = require("./src/db/database");

const app = express();
const IN_PROD = process.env.NODE_ENV === "production";

// ============================
// CORS
// ============================
const FRONTEND_ORIGIN = "https://choosewisely.neocities.org";

app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true, // útil si alguna ruta futura usa cookies
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","X-Requested-With","Accept"]
}));

// ============================
// Parseo de JSON
// ============================
app.use(express.json());

// ============================
// Test backend
// ============================
app.get("/api/test", (req, res) => {
    res.json({ ok: true, message: "Backend funcionando 🚀" });
});

// ============================
// Debug usuarios (opcional)
// ============================
app.get("/debug/users", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM users");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ============================
// Rutas
// ============================
app.use("/api/auth", authRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/match", matchRoutes);

// ============================
// Root
// ============================
app.get("/", (req,res) => res.send("Backend funcionando 🚀"));

// ============================
// Middleware 404
// ============================
app.use((req, res, next) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// ============================
// Iniciar servidor
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

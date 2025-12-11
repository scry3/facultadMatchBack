// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const authRoutes = require("./src/routes/auth.routes");
const likeRoutes = require("./src/routes/likes.routes");
const matchRoutes = require("./src/routes/matches.routes");

const pool = require("./src/db/database"); // ahora es PG, no SQLite

const app = express();

// Entorno
const IN_PROD = process.env.NODE_ENV === "production";

// Necesario para Render (proxy)
app.set("trust proxy", 1);

// ============================
// CORS
// ============================
const FRONTEND_ORIGIN = "https://choosewisely.neocities.org";

app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
        ],
    })
);

// ============================
// Parseo de JSON
// ============================
app.use(express.json());

// ============================
// Sesiones
// ============================
app.use(
    session({
        secret: process.env.SESSION_SECRET || "secreto_generico",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: IN_PROD,
            sameSite: IN_PROD ? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

// ============================
// Test
// ============================
app.get("/api/test", (req, res) => {
    res.json({ ok: true, message: "Backend funcionando" });
});

// ============================
// Debug users (ahora con PostgreSQL)
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
app.get("/", (req, res) => {
    res.send("Backend funcionando 🚀");
});

// ============================
// Inicio
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
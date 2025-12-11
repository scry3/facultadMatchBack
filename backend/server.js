// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

const authRoutes = require("./src/routes/auth.routes");
const likeRoutes = require("./src/routes/likes.routes");
const matchRoutes = require("./src/routes/matches.routes");

const pool = require("./src/db/database"); // tu pool de PostgreSQL

// ============================
// Instancia de Express
// ============================
const app = express();

// ============================
// Entorno
// ============================
const IN_PROD = process.env.NODE_ENV === "production";

// ============================
// Trust proxy (Render)
// ============================
app.set("trust proxy", 1);

// ============================
// CORS
// ============================
const FRONTEND_ORIGIN = "https://choosewisely.neocities.org";

app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        credentials: true, // necesario para cookies cross-site
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    })
);

// ============================
// Parseo de JSON
// ============================
app.use(express.json());

// ============================
// Sesiones con PostgreSQL
// ============================
app.use(
    session({
        store: new PgSession({
            pool: pool,                // tu pool de PostgreSQL
            tableName: "user_sessions",
            createTableIfMissing: true // <--- crea la tabla automáticamente si no existe
        }),
        secret: process.env.SESSION_SECRET, // obligatorio: tu secreto en Render
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: IN_PROD,            // HTTPS obligatorio en prod
            sameSite: IN_PROD ? "none" : "lax", // cross-site
            maxAge: 1000 * 60 * 60 * 24, // 1 día
        },
    })
);

// ============================
// Test
// ============================
app.get("/api/test", (req, res) => {
    res.json({ ok: true, message: "Backend funcionando 🚀" });
});

// ============================
// Debug users
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
// Middleware 404 para que fetch no reciba HTML
// ============================
app.use((req, res, next) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// ============================
// Inicio servidor
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

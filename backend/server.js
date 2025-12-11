// server.js
const express = require("express");
const cors = require("cors");
const session = require("express-session");   // importa sesiones

const authRoutes = require("./src/routes/auth.routes");
const likeRoutes = require("./src/routes/likes.routes");
const matchRoutes = require("./src/routes/matches.routes");

const db = require('./src/db/database');

const app = express();

// Entorno
const IN_PROD = process.env.NODE_ENV === 'production';

// Trust proxy (IMPORTANTE en Render / Heroku / Netlify Functions detrás de proxy)
app.set('trust proxy', 1);

// ============================
// CORS
// ============================
// Reemplazá exactamente con tu dominio frontend
const FRONTEND_ORIGIN = "https://choosewisely.neocities.org";

app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept']
}));


// ============================
// Parseo de JSON (antes de las rutas)
// ============================
app.use(express.json());

// ============================
// MIDDELWARE: SESIONES
// ============================
app.use(session({
    secret: "un_dia_vi_una_vaca_sin_cola_vestida_de_uniforme",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: IN_PROD,                      // true sólo en prod (HTTPS)
        sameSite: IN_PROD ? "none" : "lax",   // none en prod para cross-site
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));

// ============================
// TEST
// ============================
app.get('/api/test', (req, res) => {
    res.json({ ok: true, message: "Backend funcionando" });
});



// RUTA DEBUG (ver usuarios SQLite)
app.get("/debug/users", (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
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
// Iniciar servidor (usar PORT de Render)
 // ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT} (port ${PORT})`);
});




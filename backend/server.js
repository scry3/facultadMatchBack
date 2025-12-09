// server.js
const express = require("express");
const cors = require("cors");
const session = require("express-session");   // importa sesiones

const authRoutes = require("./src/routes/auth.routes");
const likeRoutes = require("./src/routes/likes.routes");
const matchRoutes = require("./src/routes/matches.routes");


const db = require('./src/db/database');

const app = express();

// ============================
// CORS
// ============================
app.use(cors({
    origin: [
        "https://choosewisely.neocities.org"
    ],
    credentials: true
}));


// ============================
// MIDDELWARE: SESIONES
// ============================
app.use(session({
    secret: "un_dia_vi_una_vaca_sin_cola_vestida_de_uniforme",  // Cambialo por algo tuyo
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,   // ⚠️ en localhost SIEMPRE false
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));

// ============================
// TEST
// ============================
app.get('/api/test', (req, res) => {
    res.json({ ok: true, message: "Backend funcionando" });
});

// ============================
// Parseo de JSON
// ============================
app.use(express.json());

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
// Iniciar servidor
// ============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

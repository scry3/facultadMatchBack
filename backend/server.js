require("dotenv").config();
const express = require("express");
const path = require("path");

// Rutas
const authRoutes = require("./src/routes/auth.routes");
const likeRoutes = require("./src/routes/likes.routes");
const matchRoutes = require("./src/routes/matches.routes");

const app = express();

// ============================
// Parseo de JSON
// ============================
app.use(express.json());

// ============================
// Servir frontend
// ============================
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Redirigir cualquier ruta no API al index.html (para SPA)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public", "index.html"));
});

// ============================
// Rutas API
// ============================
app.use("/api/auth", authRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/match", matchRoutes);

// ============================
// Test backend
// ============================
app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "Backend funcionando 🚀" });
});

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


//Crer tabla para ip(temporal)
app.get("/crear-tabla-ip", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ip_registros (
        id SERIAL PRIMARY KEY,
        ip TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT NOW()
      );
    `);
    res.send("Tabla creada OK");
  } catch (e) {
    res.send("Error: " + e);
  }
});

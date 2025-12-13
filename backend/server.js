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


const pool = require("./src/db/database");

app.get("/debug/usuarios", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, nombre, edad, carrera, descripcion, instagram
      FROM users
      ORDER BY id ASC
    `);

    res.json({
      total: result.rows.length,
      usuarios: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
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





// ============================
// ⚠️ LIMPIEZA TEMPORAL DE USUARIOS (SOLO 1 DEPLOY)
// ============================

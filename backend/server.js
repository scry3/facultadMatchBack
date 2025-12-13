require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();

app.set("trust proxy", true);


// ============================
// DB
// ============================
const pool = require("./src/db/database");

// ============================
// Rutas
// ============================
const authRoutes = require("./src/routes/auth.routes");
const likeRoutes = require("./src/routes/likes.routes");
const matchRoutes = require("./src/routes/matches.routes");

// ============================
// Parseo de JSON
// ============================
app.use(express.json());

// ============================
// 🔍 DEBUG – VER USUARIOS (SOLO DESARROLLO)
// ============================
app.get("/api/debug/usuarios", async (req, res) => {
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
// Servir frontend
// ============================
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ⚠️ REDIRECT SPA (SIEMPRE AL FINAL)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/public", "index.html")
  );
});

// ============================
// Middleware 404
// ============================
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ============================
// Iniciar servidor
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});



// ============================
// ⚠️ LIMPIEZA TEMPORAL DE USUARIOS (SOLO 1 DEPLOY)
// ============================
(async () => {
  try {
    const pool = require("./src/db/database");

    // USUARIOS A BORRAR (username)
    const usuariosABorrar = [
      "pruebaseis",
      "pruebacuatro",
      "pruebacinco"
    ];

    console.log("🧨 Iniciando limpieza de usuarios...");

    for (const username of usuariosABorrar) {
      // 1️⃣ Obtener ID del usuario
      const userRes = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );

      if (userRes.rows.length === 0) {
        console.log(`⚠️ Usuario ${username} no existe`);
        continue;
      }

      const userId = userRes.rows[0].id;

      // 2️⃣ Borrar likes donde participa
      await pool.query(
        "DELETE FROM likes WHERE user_id = $1 OR liked_user_id = $1",
        [userId]
      );

      // 3️⃣ Borrar matches donde participa
      await pool.query(
        "DELETE FROM matches WHERE user1_id = $1 OR user2_id = $1",
        [userId]
      );

      // 4️⃣ Borrar usuario
      await pool.query(
        "DELETE FROM users WHERE id = $1",
        [userId]
      );

      console.log(`✅ Usuario ${username} eliminado completamente`);
    }

    console.log("🎉 Limpieza finalizada");
  } catch (err) {
    console.error("❌ Error en limpieza:", err);
  }
})();

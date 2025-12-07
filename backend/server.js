// server.js
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/auth.routes");


// Crear la app de Express
const app = express();

app.get('/api/test', (req, res) => {
    res.json({ ok: true, message: "Backend funcionando" });
});


// Middlewares
app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    credentials: true
}));

app.use(express.json()); // permite recibir JSON en requests
app.use("/api", authRoutes);

// Ruta simple para probar
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// Levantar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

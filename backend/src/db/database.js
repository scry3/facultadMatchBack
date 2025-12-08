// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta de la base de datos (archivo .sqlite en tu proyecto)
const DB_PATH = path.join(__dirname, 'facultadMatch.db');

// Conexión a SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// ==================================
// Crear tablas si no existen
// ==================================

// Usuarios
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    nombre TEXT,
    edad INTEGER,
    carrera TEXT,
    descripcion TEXT,
    instagram TEXT
)
`);

// Likes
db.run(`
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    liked_user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(liked_user_id) REFERENCES users(id)
)
`);

// Matches
db.run(`
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER,
    user2_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user1_id) REFERENCES users(id),
    FOREIGN KEY(user2_id) REFERENCES users(id)
)
`);

module.exports = db;

const db = require('../db/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// ============================
// Registro de usuario
// ============================
async function registerUser(req, res) {
    const { username, password, nombre, edad, carrera, descripcion, instagram } = req.body;

    if (!username || !password || !nombre || !edad || !carrera) {
        return res.status(400).json({ success: false, message: "Faltan datos obligatorios." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const query = `
            INSERT INTO users (username, password, nombre, edad, carrera, descripcion, instagram)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [username, hashedPassword, nombre, edad, carrera, descripcion, instagram], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ success: false, message: 'El nombre de usuario ya existe.' });
                }
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error al registrar el usuario.' });
            }

            return res.json({
                success: true,
                message: 'Usuario registrado correctamente.',
                data: {
                    id: this.lastID,
                    username,
                    nombre,
                    edad,
                    carrera,
                    descripcion,
                    instagram
                }
            });
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error interno al procesar la contraseña.' });
    }
}

// ============================
// Login de usuario
// ============================
// ============================
// Login de usuario
// ============================
function loginUser(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Usuario o contraseña faltantes." });
    }

    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error al buscar usuario." });
        }

        if (!user) return res.status(400).json({ success: false, message: "Usuario no encontrado." });

        bcrypt.compare(password, user.password)
            .then(match => {
                if (!match) return res.status(400).json({ success: false, message: "Contraseña incorrecta." });

                // Guardamos el id del usuario en la sesión
                req.session.userId = user.id;

                // Forzamos guardar la sesión antes de responder
                req.session.save(err => {
                    if (err) {
                        console.error("Error guardando sesión:", err);
                        return res.status(500).json({ success: false, message: "Error al guardar la sesión." });
                    }

                    return res.json({
                        success: true,
                        message: "Login exitoso",
                        data: {
                            id: user.id,
                            username: user.username,
                            nombre: user.nombre,
                            edad: user.edad,
                            carrera: user.carrera,
                            descripcion: user.descripcion,
                            instagram: user.instagram
                        }
                    });
                });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ success: false, message: "Error interno al verificar contraseña." });
            });
    });
}


// ============================
// Traer usuarios al explorer
// ============================
function getAllUsers(req, res) {
    const userId = req.user.id; // viene del authMiddleware

    const query = `
        SELECT id, username, nombre, edad, carrera, descripcion, instagram
        FROM users
        WHERE id != ?
        AND id NOT IN (
            SELECT liked_user_id
            FROM likes
            WHERE user_id = ?
        )
    `;

    db.all(query, [userId, userId], (err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error al obtener usuarios.' });
        }
        return res.json(users);
    });
}


// ============================
// Actualizar perfil (desc e ig)
// ============================

function updateProfile(req, res) {
    const userId = req.user.id; // viene del authMiddleware
    const { descripcion, instagram } = req.body;

    if (!descripcion && !instagram) {
        return res.status(400).json({ success: false, message: "Nada para actualizar." });
    }

    const query = `
        UPDATE users
        SET descripcion = COALESCE(?, descripcion),
            instagram = COALESCE(?, instagram)
        WHERE id = ?
    `;

    db.run(query, [descripcion, instagram, userId], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error al actualizar el perfil." });
        }

        // Después de actualizar, devolvemos el usuario actualizado
        db.get(`SELECT id, username, nombre, edad, carrera, descripcion, instagram 
                FROM users WHERE id = ?`, [userId], (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Error al traer el usuario." });
            }

            return res.json({ success: true, message: "Perfil actualizado correctamente.", user });
        });
    });
}


// controllers/auth.controller.js
function getProfile(req, res) {
    const userId = req.user.id; // del authMiddleware
    const query = `
        SELECT id, username, nombre, edad, carrera, descripcion, instagram
        FROM users
        WHERE id = ?
    `;
    db.get(query, [userId], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error al obtener perfil.' });
        }
        return res.json(user);
    });
}


module.exports = { registerUser, loginUser, getAllUsers, updateProfile, getProfile };

const pool = require('../db/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

// =====================================
// REGISTRO DE USUARIO
// =====================================
async function registerUser(req, res) {
    const { username, password, nombre, edad, carrera, descripcion, instagram } = req.body;

    if (!username || !password || !nombre || !edad || !carrera) {
        return res.status(400).json({ success: false, message: "Faltan datos obligatorios." });
    }

    // ==========================================
    // 1) LIMITAR CANTIDAD DE CUENTAS POR IP
    // ==========================================
    const ip = req.ip;


    try {
        const check = await pool.query(
            "SELECT COUNT(*)::int AS total FROM ip_registros WHERE ip = $1",
            [ip]
        );

        const limite = 2; // cantidad máxima permitida por IP

        if (check.rows[0].total >= limite) {
            return res.status(429).json({
                success: false,
                message: "Se alcanzó el límite de cuentas creadas desde esta IP."
            });
        }
    } catch (err) {
        console.error("Error verificando IP:", err);
        return res.status(500).json({
            success: false,
            message: "Error interno verificando IP."
        });
    }

    // ==========================================
    // 2) REGISTRO NORMAL
    // ==========================================
    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const query = `
            INSERT INTO users (username, password, nombre, edad, carrera, descripcion, instagram)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, username, nombre, edad, carrera, descripcion, instagram
        `;

        const result = await pool.query(query, [
            username,
            hashedPassword,
            nombre,
            edad,
            carrera,
            descripcion,
            instagram
        ]);

        // ==========================================
        // 3) GUARDAR LA IP DESPUÉS DEL REGISTRO
        // ==========================================
        try {
            await pool.query(
                "INSERT INTO ip_registros (ip) VALUES ($1)",
                [ip]
            );
        } catch (err) {
            console.error("Error guardando IP:", err);
        }

        return res.json({
            success: true,
            message: 'Usuario registrado correctamente.',
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err);

        if (err.code === "23505") { // Unique violation
            return res.status(400).json({ success: false, message: "El nombre de usuario ya existe." });
        }

        return res.status(500).json({ success: false, message: "Error al registrar el usuario." });
    }
}


// =====================================
// LOGIN
// =====================================
async function loginUser(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Usuario o contraseña faltantes." });
    }

    try {
        const query = `SELECT * FROM users WHERE username = $1`;
        const result = await pool.query(query, [username]);

        const user = result.rows[0];
        if (!user) return res.status(400).json({ success: false, message: "Usuario no encontrado." });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ success: false, message: "Contraseña incorrecta." });

        // === Generar JWT ===
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.json({
            success: true,
            message: "Login exitoso",
            token,
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

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error interno al verificar el usuario." });
    }
}

// =====================================
// LISTAR USUARIOS PARA EL EXPLORER
// =====================================
async function getAllUsers(req, res) {
    const userId = req.user.id;

    const query = `
        SELECT id, username, nombre, edad, carrera, descripcion, instagram
        FROM users
        WHERE id != $1
        AND id NOT IN (
            SELECT liked_user_id FROM likes WHERE user_id = $1
        )
    `;

    try {
        const result = await pool.query(query, [userId]);
        return res.json(result.rows);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error al obtener usuarios.' });
    }
}

// =====================================
// EDITAR PERFIL (descripcion + IG)
// =====================================
async function updateProfile(req, res) {
    const userId = req.user.id;
    const { descripcion, instagram } = req.body;

    if (!descripcion && !instagram) {
        return res.status(400).json({ success: false, message: "Nada para actualizar." });
    }

    const query = `
        UPDATE users
        SET descripcion = COALESCE($1, descripcion),
            instagram = COALESCE($2, instagram)
        WHERE id = $3
    `;

    try {
        await pool.query(query, [descripcion, instagram, userId]);

        const updatedUser = await pool.query(
            `SELECT id, username, nombre, edad, carrera, descripcion, instagram
             FROM users WHERE id = $1`,
            [userId]
        );

        return res.json({
            success: true,
            message: "Perfil actualizado correctamente.",
            user: updatedUser.rows[0]
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error al actualizar el perfil." });
    }
}

// =====================================
// OBTENER PERFIL LOGEADO
// =====================================
async function getProfile(req, res) {
    const userId = req.user.id;

    try {
        const result = await pool.query(`
            SELECT id, username, nombre, edad, carrera, descripcion, instagram
            FROM users
            WHERE id = $1
        `, [userId]);

        return res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error al obtener perfil.' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    updateProfile,
    getProfile
};

const db = require('../db/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10; // Para hashear la contraseña

// ============================
// Registro de usuario
// ============================
async function registerUser(req, res) {
const { username, password, nombre, edad, carrera, descripcion, instagram } = req.body;

if (!username || !password || !nombre || !edad || !carrera) {
    return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios."
    });
}

try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const query = `
        INSERT INTO users (username, password, nombre, edad, carrera, descripcion, instagram)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [username, hashedPassword, nombre, edad, carrera, descripcion, instagram], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {//usuario es UNIQUE
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de usuario ya existe.'
                });
            }
            console.error(err);
            return res.status(500).json({
                success: false,
                message: 'Error al registrar el usuario.'
            });
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
    return res.status(500).json({
        success: false,
        message: 'Error interno al procesar la contraseña.'
    });
}
 

}

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

    if (!user) {
        return res.status(400).json({ success: false, message: "Usuario no encontrado." });
    }

    bcrypt.compare(password, user.password)
        .then(match => {
            if (!match) {
                return res.status(400).json({ success: false, message: "Contraseña incorrecta." });
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
    const userId = parseInt(req.query.userId); // usuario logueado

    if (!userId) return res.status(400).json({ success: false, message: 'Faltan datos.' });

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
        return res.json(users); // devolvemos la lista filtrada
    });
}




// ============================
// Traer matches del usuario
// ============================
function getMatches(req, res) {
const userId = parseInt(req.query.userId); // usuario logueado


if (!userId) return res.status(400).json({ success: false, message: 'Faltan datos.' });

const query = `
    SELECT u.id, u.username, u.nombre, u.edad, u.carrera, u.descripcion, u.instagram
    FROM matches m
    JOIN users u ON (u.id = m.user1_id OR u.id = m.user2_id)
    WHERE (m.user1_id = ? OR m.user2_id = ?) AND u.id != ?
`;

db.all(query, [userId, userId, userId], (err, rows) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error al obtener matches.' });
    }
    return res.json(rows);
});


}

module.exports = { registerUser, loginUser, getAllUsers};

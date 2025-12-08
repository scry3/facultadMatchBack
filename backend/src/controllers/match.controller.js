// ============================
// Traer matches del usuario
// ============================

const db = require('../db/database');

function getMatches(req, res) {
    const userId = parseInt(req.query.userId);

    if (!userId) {
        return res.status(400).json({ success: false, message: 'Faltan datos.' });
    }

    const query = `
        SELECT 
            u.id, u.username, u.nombre, u.edad, u.carrera, u.descripcion, u.instagram
        FROM matches m
        JOIN users u 
            ON u.id = CASE 
                WHEN m.user1_id = ? THEN m.user2_id
                ELSE m.user1_id
            END
        WHERE m.user1_id = ? OR m.user2_id = ?
    `;

    db.all(query, [userId, userId, userId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error al obtener matches.' });
        }
        return res.json(rows);
    });
}

module.exports = { getMatches };

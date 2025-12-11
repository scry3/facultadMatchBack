// controllers/match.controller.js
const pool = require("../db/database");

async function getMatches(req, res) {
    const userId = req.user.id; // viene del authJwt

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const query = `
            SELECT 
                u.id, u.username, u.nombre, u.edad, u.carrera, u.descripcion, u.instagram
            FROM matches m
            JOIN users u 
                ON u.id = CASE 
                    WHEN m.user1_id = $1 THEN m.user2_id
                    ELSE m.user1_id
                END
            WHERE m.user1_id = $1 OR m.user2_id = $1
        `;

        const result = await pool.query(query, [userId]);

        return res.json(result.rows);

    } catch (err) {
        console.error("Error obteniendo matches:", err);
        return res.status(500).json({
            success: false,
            message: "Error al obtener matches."
        });
    }
}

module.exports = { getMatches };

// controllers/likes.controller.js
const pool = require("../db/database");

// ==========================================
// Dar Like a otro usuario
// ==========================================
async function likeUser(req, res) {
    const userId = req.user.id;          // viene del authJwt
    const likedUserId = parseInt(req.params.id); // usuario que recibirá el like

    if (!userId || !likedUserId) {
        return res.status(400).json({ success: false, message: "Faltan datos." });
    }

    try {
        // 1) Guardamos el like
        const insertLikeQuery = `
            INSERT INTO likes (user_id, liked_user_id)
            VALUES ($1, $2)
        `;
        await pool.query(insertLikeQuery, [userId, likedUserId]);

        // 2) Verificamos si el otro usuario también nos dio like → MATCH
        const checkMatchQuery = `
            SELECT * FROM likes
            WHERE user_id = $1 AND liked_user_id = $2
        `;
        const matchResult = await pool.query(checkMatchQuery, [likedUserId, userId]);

        const isMatch = matchResult.rows.length > 0;

        // 3) Si hay match, guardamos en matches
        if (isMatch) {
            const insertMatchQuery = `
                INSERT INTO matches (user1_id, user2_id)
                VALUES ($1, $2)
                RETURNING id
            `;
            await pool.query(insertMatchQuery, [userId, likedUserId]);

            // 4) Traemos el partner
            const partnerQuery = `
                SELECT id, username, nombre, edad, carrera, descripcion, instagram
                FROM users
                WHERE id = $1
            `;
            const partnerResult = await pool.query(partnerQuery, [likedUserId]);

            return res.json({
                match: true,
                partner: partnerResult.rows[0]
            });
        }

        // 4) Si NO hay match
        return res.json({ match: false });

    } catch (err) {
        console.error(err);

        // Evitar error feo si se intenta dar like 2 veces
        if (err.code === "23505") {
            return res.status(400).json({
                success: false,
                message: "Ya le diste like a este usuario."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error al procesar el like."
        });
    }
}

module.exports = { likeUser };

// ============================
// Dar Like a otro usuario
// ============================

const db = require("../db/database");

function likeUser(req, res) {
const userId = parseInt(req.query.userId); // quien da el like
const likedUserId = parseInt(req.params.id); // a quien le damos like

 
if (!userId || !likedUserId) {
    return res.status(400).json({ success: false, message: 'Faltan datos.' });
}

// Guardamos el like
const insertLike = `INSERT INTO likes (user_id, liked_user_id) VALUES (?, ?)`;
db.run(insertLike, [userId, likedUserId], function(err) {
    if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error al guardar like.' });
    }

    // Revisamos si el otro usuario también nos dio like
    const checkMatch = `SELECT * FROM likes WHERE user_id = ? AND liked_user_id = ?`;
    db.get(checkMatch, [likedUserId, userId], (err, match) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error al comprobar match.' });
        }

        if (match) {
            // Si hay match, guardamos en matches
            const insertMatch = `INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)`;
            db.run(insertMatch, [userId, likedUserId], function(err2) {
                if (err2) {
                    console.error(err2);
                    return res.status(500).json({ success: false, message: 'Error al guardar match.' });
                }

                // Devolvemos match verdadero con info del partner
                const getPartner = `SELECT id, username, nombre, edad, carrera, descripcion, instagram FROM users WHERE id = ?`;
                db.get(getPartner, [likedUserId], (err3, partner) => {
                    if (err3) {
                        console.error(err3);
                        return res.status(500).json({ success: false, message: 'Error al traer datos del partner.' });
                    }
                    return res.json({ match: true, partner });
                });
            });
        } else {
            // No hay match
            return res.json({ match: false });
        }
    });
});

}

module.exports = {likeUser};

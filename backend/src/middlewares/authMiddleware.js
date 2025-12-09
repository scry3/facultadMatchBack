// src/middlewares/authMiddleware.js
function authRequired(req, res, next) {
    console.log("llego al middleware");
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "No autorizado. Inicia sesión."
        });
    }

    // Guardamos el usuario en req.user para que los controllers puedan usarlo
    req.user = { id: req.session.userId };

    next();
}

module.exports = authRequired;

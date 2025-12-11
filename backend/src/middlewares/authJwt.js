const jwt = require("jsonwebtoken");

function authJwt(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ success: false, message: "No autorizado" });

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ success: false, message: "Token faltante" });

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: user.id, username: user.username };
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token inválido o expirado" });
    }
}

module.exports = authJwt;

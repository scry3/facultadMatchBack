// Funcion que maneja el registro de usuario
// req = datos que envía el frontend
// res = lo que devolvemos al frontend
function registerUser(req, res) {
    const {
        username,
        password,
        nombre,
        edad,
        carrera,
        descripcion,
        instagram
    } = req.body;

    // Validaciones simples
    if (!username || !password || !nombre || !edad || !carrera) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos obligatorios."
        });
    }

    res.json({
        success: true,
        message: "Usuario recibido correctamente.",
        data: {
            username,
            password,
            nombre,
            edad,
            carrera,
            descripcion,
            instagram
        }
    });
}



// TEMPORAL: login de prueba
function loginUser(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Usuario o contraseña faltantes."
        });
    }

    // Por ahora no verificamos nada,
    // solo devolvemos "login ok".
    res.json({
        success: true,
        message: "Login exitoso (modo prueba)."
    });
}

module.exports = { registerUser, loginUser };

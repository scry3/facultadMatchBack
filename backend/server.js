// ============================
// Sesiones con PostgreSQL
// ============================
app.use(
    session({
        store: new PgSession({
            pool: pool,                // tu pool de PostgreSQL
            tableName: "user_sessions",
            createTableIfMissing: true // <--- crea la tabla automáticamente si no existe
        }),
        secret: process.env.SESSION_SECRET, // obligatorio: tu secreto en Render
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: IN_PROD,            // HTTPS obligatorio en prod
            sameSite: IN_PROD ? "none" : "lax", // cross-site
            maxAge: 1000 * 60 * 60 * 24, // 1 día
        },
    })
);

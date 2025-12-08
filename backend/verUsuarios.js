const db = require('./src/db/database');

db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Usuarios en la DB:");
    console.table(rows); // muestra en tabla en la terminal
    process.exit(); // cierra la conexión
});

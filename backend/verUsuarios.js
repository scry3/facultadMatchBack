const pool = require('./src/db/database');

(async () => {
  try {
    const res = await pool.query("SELECT * FROM users");
    console.log("Usuarios en la DB:");
    console.table(res.rows); // muestra en tabla en la terminal
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end(); // cierra la conexión
  }
})();

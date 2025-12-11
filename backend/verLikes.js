const pool = require("./src/db/database");

(async () => {
  try {
    const res = await pool.query("SELECT * FROM likes");
    console.log("Likes en la DB:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end(); // cierra la conexión
  }
})();

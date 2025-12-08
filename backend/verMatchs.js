const db = require('./src/db/database');

db.all("SELECT * FROM matches", [], (err, rows) => {
    if (err) return console.error(err.message);

    console.log("Matches en la DB:");
    console.table(rows);

    process.exit();
});

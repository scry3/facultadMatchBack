const db = require('./src/db/database');

db.all("SELECT * FROM likes", [], (err, rows) => {
    if (err) return console.error(err.message);

    console.log("Likes en la DB:");
    console.table(rows);

    process.exit();
});

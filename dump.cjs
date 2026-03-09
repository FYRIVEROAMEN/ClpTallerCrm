const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/taller.sqlite');

db.serialize(() => {
  db.all("SELECT * FROM clients", (err, rows) => {
    console.log("CLIENTS:", rows);
  });
  db.all("SELECT * FROM vehicles", (err, rows) => {
    console.log("VEHICLES:", rows);
  });
});
db.close();

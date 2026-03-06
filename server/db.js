const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'taller.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Tabla Clientes
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla Vehiculos
    db.run(`CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      plate TEXT UNIQUE NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      currentMileage INTEGER,
      ownerId TEXT,
      FOREIGN KEY (ownerId) REFERENCES clients (id)
    )`);

    // Tabla Servicios
    db.run(`CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      vehicleId TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      description TEXT NOT NULL,
      mileage INTEGER,
      cost REAL,
      FOREIGN KEY (vehicleId) REFERENCES vehicles (id)
    )`);

    // Tabla Turnos
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      date DATETIME NOT NULL,
      clientId TEXT,
      vehicleId TEXT,
      reason TEXT,
      estimatedCost REAL DEFAULT 0,
      status TEXT DEFAULT 'PENDING',
      FOREIGN KEY (clientId) REFERENCES clients (id),
      FOREIGN KEY (vehicleId) REFERENCES vehicles (id)
    )`, (err) => {
      // Intenta migrar la tabla si ya existe pero le falta la columna de la Fase 11
      if (!err) {
        db.run(`ALTER TABLE appointments ADD COLUMN estimatedCost REAL DEFAULT 0`, (errAdd) => {
          if (errAdd && !errAdd.message.includes('duplicate column name')) {
            console.error("Error migrando tabla turnos:", errAdd.message);
          }
        });
      }
    });

    // Tabla Bahias
    db.run(`CREATE TABLE IF NOT EXISTS work_bays (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      isOccupied BOOLEAN DEFAULT 0,
      currentVehicleId TEXT,
      FOREIGN KEY (currentVehicleId) REFERENCES vehicles (id)
    )`, (err) => {
      if(!err) {
        db.get(`SELECT COUNT(*) as count FROM work_bays`, (err, row) => {
          if (row && row.count === 0) {
            db.run(`INSERT INTO work_bays (id, name, isOccupied) VALUES ('wb1', 'Bahía de Diagnóstico', 0)`);
            db.run(`INSERT INTO work_bays (id, name, isOccupied) VALUES ('wb2', 'Mecánica Ligera', 0)`);
            db.run(`INSERT INTO work_bays (id, name, isOccupied) VALUES ('wb3', 'Mantenimiento General', 0)`);
          }
        });
      }
    });

    // Insertar un usuario admin para el login por defecto
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`, (err) => {
      if (!err) {
        const bcrypt = require('bcryptjs');
        const adminHash = bcrypt.hashSync('admin', 10);
        db.run(`INSERT OR IGNORE INTO users (username, password) VALUES ('admin', '${adminHash}')`);
        db.run(`UPDATE users SET password = '${adminHash}' WHERE username = 'admin'`);
      }
    });
  });
}

module.exports = db;

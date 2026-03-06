const db = require('./db');

setTimeout(() => {
  db.run(`INSERT INTO appointments (id, date, clientId, vehicleId, reason, estimatedCost, status) VALUES ('test-id', '2026-03-06T10:00:00.000Z', 'c1', 'v1', 'test reason', 100, 'PENDING')`, function(err) {
    if (err) {
      console.error('ERROR AL INSERTAR:', err.message);
    } else {
      console.log('EXITO. Insertado correctamente.');
    }
  });
}, 1000);

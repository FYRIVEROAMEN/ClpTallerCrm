const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos de React (compilado en Producción)
const buildPath = path.join(__dirname, '..', 'dist');
app.use(express.static(buildPath));

const JWT_SECRET = 'secreto_taller_clp_123'; // Para pruebas. En prod usar ENV.

// --- MIDDLEWARE AUTENTICACION ---
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Acceso denegado' });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token inválido' });
  }
};

// --- AUTHENTICATION ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPass = bcrypt.compareSync(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.header('Authorization', token).json({ token, user: { id: user.id, username: user.username } });
  });
});

// --- CLIENTES ---
app.get('/api/clientes', auth, (req, res) => {
  db.all(`SELECT * FROM clients`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/clientes', auth, (req, res) => {
  const { id, name, phone, email } = req.body;
  db.run(`INSERT INTO clients (id, name, phone, email) VALUES (?, ?, ?, ?)`, 
    [id, name, phone, email], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, phone, email });
    }
  );
});

app.put('/api/clientes/:id', auth, (req, res) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;
  db.run(`UPDATE clients SET name = ?, phone = ?, email = ? WHERE id = ?`, 
    [name, phone, email, id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, phone, email });
    }
  );
});

// --- VEHÍCULOS ---
app.get('/api/vehiculos', auth, (req, res) => {
  db.all(`SELECT * FROM vehicles`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/vehiculos/:id', auth, (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM vehicles WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.post('/api/vehiculos', auth, (req, res) => {
  const { id, plate, brand, model, year, currentMileage, ownerId } = req.body;
  db.run(`INSERT INTO vehicles (id, plate, brand, model, year, currentMileage, ownerId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, plate, brand, model, year, currentMileage, ownerId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, plate, brand, model, year, currentMileage, ownerId });
    }
  );
});

// TRANSFERENCIA PROPIEDAD
app.put('/api/vehiculos/:id/transferir', auth, (req, res) => {
  const { id } = req.params;
  const { newOwnerId } = req.body;
  db.run(`UPDATE vehicles SET ownerId = ? WHERE id = ?`, [newOwnerId, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, newOwnerId });
  });
});

// NUEVO SERVICIO A VEHICULO
app.post('/api/vehiculos/:id/servicio', auth, (req, res) => {
  const { id } = req.params;
  const { serviceId, description, mileage, cost } = req.body;
  
  // 1. Guardar servicio en DB
  db.run(`INSERT INTO services (id, vehicleId, description, mileage, cost) VALUES (?, ?, ?, ?, ?)`,
    [serviceId, id, description, mileage, cost],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // 2. Actualizar kilometraje del vehiculo
      db.run(`UPDATE vehicles SET currentMileage = ? WHERE id = ? AND currentMileage < ?`, [mileage, id, mileage], (errUpdate) => {
         if (errUpdate) console.error("Error al actualizar kilometraje", errUpdate.message);
         res.json({ success: true, serviceId, description });
      });
    }
  );
});

app.get('/api/vehiculos/:id/servicios', auth, (req, res) => {
  const { id } = req.params;
  db.all(`SELECT * FROM services WHERE vehicleId = ? ORDER BY date DESC`, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- TURNOS ---
app.get('/api/turnos', auth, (req, res) => {
  db.all(`SELECT * FROM appointments`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/turnos', auth, (req, res) => {
  const { id, date, clientId, vehicleId, reason, estimatedCost, status } = req.body;
  const cost = estimatedCost || 0;
  db.run(`INSERT INTO appointments (id, date, clientId, vehicleId, reason, estimatedCost, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, date, clientId, vehicleId, reason, cost, status],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, date });
    }
  );
});

// --- BAHIAS ---
app.get('/api/bahias', auth, (req, res) => {
  db.all(`SELECT * FROM work_bays`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => ({...row, isOccupied: Boolean(row.isOccupied)})));
  });
});

app.post('/api/bahias', auth, (req, res) => {
  const { id, name } = req.body;
  db.run(`INSERT INTO work_bays (id, name, isOccupied, currentVehicleId) VALUES (?, ?, 0, NULL)`,
    [id, name],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, isOccupied: false });
    }
  );
});

app.put('/api/bahias/:id/nombre', auth, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.run(`UPDATE work_bays SET name = ? WHERE id = ?`, [name, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, name });
  });
});

app.put('/api/bahias/:id/asignar', auth, (req, res) => {
  const { id } = req.params;
  const { vehicleId } = req.body; // si es null se libera
  const isOccupied = vehicleId ? 1 : 0;
  db.run(`UPDATE work_bays SET isOccupied = ?, currentVehicleId = ? WHERE id = ?`, [isOccupied, vehicleId, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, vehicleId });
  });
});

// --- REACT ROUTER FALLBACK ---
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Backend corriendo en puerto ${PORT}`));

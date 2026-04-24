// backend/src/app.js
// Configuration Express

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 'http://127.0.0.1:3000',
    'http://localhost:5500', 'http://127.0.0.1:5500',
    'http://localhost:8080', 'http://127.0.0.1:8080',
    'http://localhost:8000', 'http://127.0.0.1:8000',
    'http://localhost:4000', 'http://127.0.0.1:4000',
  ],
  credentials: true
}));

app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Serveur SereniSpa fonctionne!' });
});

// Routes
const authRoutes = require('./routes/auth');
const agendementRoutes = require('./routes/agendements');
const massagistesRoutes = require('./routes/massagistes');
const servicesRoutes = require('./routes/services');
const adminRoutes = require('./routes/admin');

app.use('/api/admin', adminRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/agendements', agendementRoutes);
app.use('/api/massagistes', massagistesRoutes);

// Rota protégée de test
const validerToken = require('./middlewares/authentification');
app.get('/api/profile', validerToken, (req, res) => {
  res.json({ 
    message: 'Vous êtes authentifié!',
    clientId: req.clientId,
    role: req.role 
  });
});

module.exports = app;
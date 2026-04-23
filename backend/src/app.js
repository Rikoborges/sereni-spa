// backend/src/routes/auth.js
// Garantir que JWT_SECRET existe
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET não definido no .env');
  process.env.JWT_SECRET = 'seu_segredo_super_secreto_minimo_32_caracteres_temporario';
}



const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Créer l'application Express
const app = express();


app.use(helmet()); // En-têtes de sécurité
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware pour lire JSON
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Serveur SereniSpa fonctionne!' });
});

// Import routes
const authRoutes = require('./routes/auth');

//
app.use('/api/auth', authRoutes);

// 
module.exports = app;

// Exporter l'application (vous allez l'utiliser dans server.js)
module.exports = app;
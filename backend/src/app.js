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


// Importar middleware de autenticação
const validerToken = require('./middlewares/authentification');

// Rota protegida - teste
app.get('/api/profile', validerToken, (req, res) => {
  res.json({ 
    message: 'Vous êtes authentifié!',
    clientId: req.clientId,
    role: req.role 
  });
});

// Importer les routes d'agendements
const agendementRoutes = require('./routes/agendements');

// Utiliser les routes
app.use('/api/agendements', agendementRoutes);

module.exports = app;
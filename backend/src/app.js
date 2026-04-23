// backend/src/app.js

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

// Exporter l'application (vous allez l'utiliser dans server.js)
module.exports = app;
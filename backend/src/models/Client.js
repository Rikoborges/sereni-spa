// backend/src/models/Client.js
// Modèle Client (utilisateurs du spa)

const mongoose = require('mongoose');

const schemaMasseClient = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    minlength: 3
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    unique: true,
    lowercase: true
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est obligatoire']
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: 8
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  },
  dateInscription: {
    type: Date,
    default: Date.now
  }
});

const Client = mongoose.model('Client', schemaMasseClient);

module.exports = Client;
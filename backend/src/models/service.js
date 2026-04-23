// backend/src/models/Service.js
// Modèle Service (types de massages)

const mongoose = require('mongoose');

const schemaService = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du service est obligatoire']
  },
  description: {
    type: String,
    default: ''
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: 0
  },
  dureeMinutes: {
    type: Number,
    default: 55
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

const Service = mongoose.model('Service', schemaService);

module.exports = Service;
// backend/src/models/Massagiste.js
// Modèle Massagiste (prestataires du spa)

const mongoose = require('mongoose');

const schemaMassagiste = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du massagiste est obligatoire']
  },
  specialite: {
    type: String,
    enum: ['détente', 'relaxation', 'thérapeutique'],
    required: true
  },
  photo: {
    type: String, // URL de la photo
    default: null
  },
  horaireDébut: {
    type: String, // Format: "09:00"
    default: '09:00'
  },
  horaireFin: {
    type: String, // Format: "17:00"
    default: '17:00'
  },
 joursOuverts: {
  type: [String],
  enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  default: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
},
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

const Massagiste = mongoose.model('Massagiste', schemaMassagiste);

module.exports = Massagiste;
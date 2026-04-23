// backend/src/models/Agendement.js
// Modèle Agendement (réservations de massage)

const mongoose = require('mongoose');

const schemaAgendement = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, "L'ID client est obligatoire"]
  },
  massagisteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Massagiste',
    required: [true, "L'ID massagiste est obligatoire"]
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, "L'ID service est obligatoire"]
  },
  date: {
    type: String, // Format: "2025-04-25"
    required: [true, 'La date est obligatoire']
  },
  heure: {
    type: String, // Format: "14:00"
    required: [true, "L'heure est obligatoire"]
  },
  heureFin: {
    type: String, // Calculé automatiquement
    default: function() {
      // Ajouter 55 minutes à l'heure de début
      return this.heure; // À implémenter plus tard
    }
  },
  statut: {
    type: String,
    enum: ['confirmé', 'en attente', 'annulé'],
    default: 'en attente'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

const Agendement = mongoose.model('Agendement', schemaAgendement);

module.exports = Agendement;
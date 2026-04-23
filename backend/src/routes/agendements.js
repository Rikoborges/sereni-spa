// backend/src/routes/agendements.js
// Routes d'agendement de massages

const express = require('express');
const router = express.Router();
const Agendement = require('../models/Agendement');
const validerToken = require('../middlewares/authentification');

// Créer un nouvel agendement (client authentifié)
router.post('/', validerToken, async (req, res) => {
  try {
    const { massagisteId, serviceId, date, heure } = req.body;

    // Valider si le slot est déjà occupé
    const agendementExiste = await Agendement.findOne({
      massagisteId,
      date,
      heure,
      statut: { $ne: 'annulé' } // Ignorer les agendements annulés
    });

    if (agendementExiste) {
      return res.status(409).json({ erreur: 'Créneauhoraire déjà occupé' });
    }

    // Créer l'agendement
    const nouvelAgendement = new Agendement({
      clientId: req.clientId,
      massagisteId,
      serviceId,
      date,
      heure,
      heureFin: calculerHeureFin(heure), // Ajouter 55 minutes
      statut: 'confirmé'
    });

    await nouvelAgendement.save();

    res.status(201).json({ 
      message: 'Agendement créé avec succès!',
      agendementId: nouvelAgendement._id 
    });
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

// Fonction auxiliaire pour calculer l'heure de fin
function calculerHeureFin(heure) {
  const [h, m] = heure.split(':').map(Number);
  const totalMinutes = h * 60 + m + 55; // Ajouter 55 minutes
  const nouvelleHeure = Math.floor(totalMinutes / 60) % 24;
  const nouvelleMinute = totalMinutes % 60;
  return `${String(nouvelleHeure).padStart(2, '0')}:${String(nouvelleMinute).padStart(2, '0')}`;
}

// Obtenir mes agendements
router.get('/mes-agendements', validerToken, async (req, res) => {
  try {
    const agendements = await Agendement.find({ clientId: req.clientId })
      .populate('massagisteId', 'nom specialite')
      .populate('serviceId', 'nom prix');

    res.json(agendements);
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

// Annuler un agendement
router.put('/:id/annuler', validerToken, async (req, res) => {
  try {
    const agendement = await Agendement.findById(req.params.id);

    if (!agendement) {
      return res.status(404).json({ erreur: 'Agendement non trouvé' });
    }

    if (agendement.clientId.toString() !== req.clientId) {
      return res.status(403).json({ erreur: 'Non autorisé' });
    }

    agendement.statut = 'annulé';
    await agendement.save();

    res.json({ message: 'Agendement annulé avec succès!' });
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

module.exports = router;
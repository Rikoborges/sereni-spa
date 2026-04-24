const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Agendement = require('../models/Agendement');
const validerToken = require('../middlewares/authentification');

// Créer un nouvel agendement (client authentifié)
router.post('/', validerToken, async (req, res) => {
  try {
    const { massagisteId, serviceId, date, heure } = req.body;

    // Convertir strings em ObjectId
    let massagisteIdObj, serviceIdObj;
    try {
      massagisteIdObj = new mongoose.Types.ObjectId(massagisteId);
      serviceIdObj = new mongoose.Types.ObjectId(serviceId);
    } catch (err) {
      return res.status(400).json({ erreur: 'IDs invalides' });
    }

    // Valider si le slot est déjà occupé
    const agendementExiste = await Agendement.findOne({
      massagisteId: massagisteIdObj,
      date,
      heure,
      statut: { $ne: 'annulé' }
    });

    if (agendementExiste) {
      return res.status(409).json({ erreur: 'Créneau horaire déjà occupé' });
    }

    // Créer l'agendement
    const nouvelAgendement = new Agendement({
      clientId: req.clientId,
      massagisteId: massagisteIdObj,
      serviceId: serviceIdObj,
      date,
      heure,
      heureFin: calculerHeureFin(heure),
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
  const totalMinutes = h * 60 + m + 55;
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
// backend/src/routes/admin.js
// Routes pour l'administration des agendements

const express = require('express');
const router = express.Router();
const Agendement = require('../models/Agendement');
const validerToken = require('../middlewares/authentification');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Middleware pour vérifier que c'est un admin
const verifierAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ erreur: 'Accès non autorisé' });
  }
  next();
};

// Obtenir tous les agendements avec filtres
router.get('/agendements', validerToken, verifierAdmin, async (req, res) => {
  try {
    const { statut, massagisteId, dateDebut, dateFin } = req.query;
    
    let filtre = {};
    if (statut) filtre.statut = statut;
    if (massagisteId) filtre.massagisteId = massagisteId;
    if (dateDebut || dateFin) {
      filtre.date = {};
      if (dateDebut) filtre.date.$gte = dateDebut;
      if (dateFin) filtre.date.$lte = dateFin;
    }

    const agendements = await Agendement.find(filtre)
      .populate('clientId', 'nom email telephone')
      .populate('massagisteId', 'nom specialite')
      .populate('serviceId', 'nom prix');

    res.json(agendements);
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

// Confirmer un agendement
router.put('/agendements/:id/confirmer', validerToken, verifierAdmin, async (req, res) => {
  try {
    const agendement = await Agendement.findByIdAndUpdate(
      req.params.id,
      { statut: 'confirmé' },
      { new: true }
    );

    if (!agendement) {
      return res.status(404).json({ erreur: 'Agendement non trouvé' });
    }

    res.json({ message: 'Agendement confirmé!', agendement });
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

// Annuler un agendement (admin)
router.delete('/agendements/:id', validerToken, verifierAdmin, async (req, res) => {
  try {
    const agendement = await Agendement.findByIdAndUpdate(
      req.params.id,
      { statut: 'annulé' },
      { new: true }
    );

    if (!agendement) {
      return res.status(404).json({ erreur: 'Agendement non trouvé' });
    }

    res.json({ message: 'Agendement annulé!' });
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

module.exports = router;
// backend/src/routes/services.js
// Routes pour les services de massage

const express = require('express');
const router = express.Router();
const Service = require('../models/service');

// Obtenir tous les services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

// Obtenir un service par ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ erreur: 'Service non trouvé' });
    }

    res.json(service);
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

module.exports = router;
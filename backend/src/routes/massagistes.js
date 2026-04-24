
const express = require('express');
const router = express.Router();
const Massagiste = require('../models/Massagiste');

// Obtenir tous les massagistes
router.get('/', async (req, res) => {
  try {
    const massagistes = await Massagiste.find();
    res.json(massagistes);
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

// Obtenir un massagiste par ID
router.get('/:id', async (req, res) => {
  try {
    const massagiste = await Massagiste.findById(req.params.id);
    
    if (!massagiste) {
      return res.status(404).json({ erreur: 'Massagiste non trouvé' });
    }

    res.json(massagiste);
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

// Obtenir les slots disponibles pour un massagiste
router.get('/:id/slots-disponibles', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ erreur: 'La date est requise' });
    }

    const massagiste = await Massagiste.findById(req.params.id);
    
    if (!massagiste) {
      return res.status(404).json({ erreur: 'Massagiste non trouvé' });
    }

    // Vérifier si c'est un jour ouvert
    const dateObj = new Date(date + 'T12:00');
    const joursMap = {
      0: 'dimanche',
      1: 'lundi',
      2: 'mardi',
      3: 'mercredi',
      4: 'jeudi',
      5: 'vendredi',
      6: 'samedi'
    };
    const jourActuel = joursMap[dateObj.getDay()];
    if (!massagiste.joursOuverts.includes(jourActuel)) {
      return res.status(400).json({ erreur: `Le spa est fermé le ${jourActuel}` });
    }

    // Générer les slots de 55 minutes
    const slots = genererSlots(
      massagiste.horaireDébut,
      massagiste.horaireFin,
      req.params.id,
      date
    );

    res.json(slots);
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

// Fonction pour générer les slots de 55 minutes
async function genererSlots(debut, fin, massagisteId, date) {
  const slots = [];
  const Agendement = require('../models/Agendement');

  // Convertir heures en minutes
  const [hDebut, mDebut] = debut.split(':').map(Number);
  const [hFin, mFin] = fin.split(':').map(Number);

  let minutesActuelles = hDebut * 60 + mDebut;
  const minutesFin = hFin * 60 + mFin;

  while (minutesActuelles + 55 <= minutesFin) {
    const heure = String(Math.floor(minutesActuelles / 60)).padStart(2, '0');
    const minute = String(minutesActuelles % 60).padStart(2, '0');
    const heureString = `${heure}:${minute}`;

    // Vérifier si le slot est occupé
    const agendementExiste = await Agendement.findOne({
      massagisteId,
      date,
      heure: heureString,
      statut: { $ne: 'annulé' }
    });

    slots.push({
      heure: heureString,
      disponible: !agendementExiste
    });

    minutesActuelles += 55;
  }

  return slots;
}

module.exports = router;

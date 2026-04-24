const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 
router.post('/inscription', async (req, res) => {
  try {
    const { nom, email, telephone, motDePasse } = req.body;

    // Validar se cliente já existe
    const clientExiste = await Client.findOne({ email });
    if (clientExiste) {
      return res.status(400).json({ erreur: 'Email déjà utilisé' });
    }

    // 
    const motDePasseHash = await bcrypt.hash(motDePasse, 10);

    // Criar novo cliente
    const novoClient = new Client({
      nom,
      email,
      telephone,
      motDePasse: motDePasseHash
    });

    await novoClient.save();

    res.status(201).json({ message: 'Client inscrit avec succès!', clientId: novoClient._id });
  } catch (erro) {
    res.status(500).json({ erreur: erro.message });
  }
});

// LOGIN cliente
router.post('/connexion', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Encontrar cliente
    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(motDePasse, client.motDePasse);
    if (!senhaCorreta) {
      return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
    }

    // Criar JWT token
    const token = jwt.sign(
      { clientId: client._id, role: client.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Connexion réussie!', token, clientId: client._id });
  } catch (erro) {
    res.status(500).json({ erreur: erro.message });
  }
});

module.exports = router;
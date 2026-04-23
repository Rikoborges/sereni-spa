// backend/src/config/database.js
// Connecter à MongoDB (comme page 60-65 du PDF)

const mongoose = require('mongoose');

const connecterDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' MongoDB connecté avec succès!');
  } catch (erreur) {
    console.error(' Erreur de connexion MongoDB:', erreur.message);
    process.exit(1); // Arrêter le serveur si connexion échoue
  }
};

module.exports = connecterDB;
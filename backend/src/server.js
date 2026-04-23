// backend/src/server.js
// Démarrer le serveur Express

require('dotenv').config(); // Charger les variables du .env
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
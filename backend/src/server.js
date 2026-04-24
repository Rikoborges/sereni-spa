// backend/src/server.js
// Carregar .env PRIMEIRO
require('dotenv').config();

// Se não tiver no .env, usar valores padrão (apenas para DEV)
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://rico3836_db-user:!Rikko61612730@cluster1.cmqnudr.mongodb.net/sereni-spa?appName=Cluster1';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'seu_segredo_super_secreto_minimo_32_caracteres_aqui_12345';
}

process.env.PORT = process.env.PORT || 5000;

const app = require('./app');
const connecterDB = require('./config/database');

const PORT = process.env.PORT;

connecterDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
  });
}).catch(erro => {
  console.error(' Erreur:', erro.message);
  process.exit(1);
});
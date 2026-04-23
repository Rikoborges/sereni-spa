// backend/src/server.js
// Variáveis hardcoded para testar (TEMPORÁRIO)
process.env.MONGODB_URI = 'mongodb+srv://rico3836_db-user:!Rikko61612730@cluster1.cmqnudr.mongodb.net/sereni-spa?appName=Cluster1';
process.env.PORT = 5000;

const app = require('./app');
const connecterDB = require('./config/database');

const PORT = process.env.PORT || 5000;

connecterDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
  });
}).catch(erro => {
  console.error(' Erreur:', erro.message);
  process.exit(1);
});
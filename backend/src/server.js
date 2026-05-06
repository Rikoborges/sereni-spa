// backend/src/server.js
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI não definido no .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET não definido no .env');
  process.exit(1);
}

process.env.PORT = process.env.PORT || 5000;

const app = require('./app');
const connecterDB = require('./config/database');
const cron = require('node-cron');
const Agendement = require('./models/Agendement');

const PORT = process.env.PORT;

connecterDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
  });

  // Limpeza automática — todo dia às 2h da manhã
  cron.schedule('0 2 * * *', async () => {
    const il6mois = new Date();
    il6mois.setMonth(il6mois.getMonth() - 6);

    const result = await Agendement.deleteMany({
      statut: 'annulé',
      date: { $lt: il6mois.toISOString().split('T')[0] }
    });

    console.log(`🧹 ${result.deletedCount} agendements annulés supprimés`);
  });

}).catch(erro => {
  console.error('❌ Erreur:', erro.message);
  process.exit(1);
});
// Popula o banco com massagistas e serviços iniciais
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://rico3836_db-user:!Rikko61612730@cluster1.cmqnudr.mongodb.net/sereni-spa?appName=Cluster1';
}

const mongoose = require('mongoose');
const Massagiste = require('./models/Massagiste');
const Service = require('./models/service');

const massagistes = [
  {
    nom: 'Marie Laurent',
    specialite: 'relaxation',
    horaireDébut: '09:00',
    horaireFin: '17:00',
    joursOuverts: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  },
  {
    nom: 'Sophie Bernard',
    specialite: 'détente',
    horaireDébut: '09:00',
    horaireFin: '17:00',
    joursOuverts: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  },
  {
    nom: 'Claire Martin',
    specialite: 'thérapeutique',
    horaireDébut: '10:00',
    horaireFin: '18:00',
    joursOuverts: ['mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  }
];

const services = [
  { nom: 'Massage suédois', description: 'Relaxation profonde', prix: 65, dureeMinutes: 55 },
  { nom: 'Massage aux pierres', description: 'Soin signature', prix: 85, dureeMinutes: 55 },
  { nom: 'Soin visage', description: 'Éclat naturel', prix: 75, dureeMinutes: 55 }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connecté à MongoDB');

  const massagistesExistants = await Massagiste.countDocuments();
  if (massagistesExistants === 0) {
    await Massagiste.insertMany(massagistes);
    console.log(`✅ ${massagistes.length} massagistes créés`);
  } else {
    console.log(`ℹ️  ${massagistesExistants} massagistes déjà présents, ignoré`);
  }

  const servicesExistants = await Service.countDocuments();
  if (servicesExistants === 0) {
    await Service.insertMany(services);
    console.log(`✅ ${services.length} services créés`);
  } else {
    console.log(`ℹ️  ${servicesExistants} services déjà présents, ignoré`);
  }

  await mongoose.disconnect();
  console.log('Seed terminé');
}

seed().catch(err => {
  console.error('Erreur seed:', err.message);
  process.exit(1);
});

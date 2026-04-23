// backend/src/config/database.js
const mongoose = require('mongoose');

const connecterDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('🔍 URI tentando conectar:', uri ? 'EXISTE' : 'NÃO EXISTE');
    console.log('🔍 Todas as variáveis:', Object.keys(process.env).filter(k => k.includes('MONGO')));
    
    if (!uri) {
      throw new Error('MONGODB_URI não definido no .env');
    }
    
    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado com sucesso!');
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    process.exit(1);
  }
};

module.exports = connecterDB;
// backend/src/middlewares/authentification.js
// Middleware para validar JWT token

const jwt = require('jsonwebtoken');

const validerToken = (req, res, next) => {
  try {
    // Pegar token do header Authorization
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ erreur: 'Token manquant' });
    }

    // Valider token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.clientId = decoded.clientId;
    req.role = decoded.role;
    
    next(); // Continuer para próxima rota
  } catch (erro) {
    res.status(401).json({ erreur: 'Token invalide ou expiré' });
  }
};

module.exports = validerToken;
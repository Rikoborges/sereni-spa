const adminMiddleware = (req, res, next) => {
  if (!req.role || req.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
  }
  next();
};

module.exports = adminMiddleware;
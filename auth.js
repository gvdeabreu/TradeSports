// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // garanta um shape simples para frente:
    req.usuario = { id: decoded.id };
    next();
  } catch (e) {
    return res.status(401).json({ erro: 'Token inválido.' });
  }
};

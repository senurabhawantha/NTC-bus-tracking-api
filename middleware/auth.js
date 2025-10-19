// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function protect(req, res, next) {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized. Missing token.' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET); // { id: ... }
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
};

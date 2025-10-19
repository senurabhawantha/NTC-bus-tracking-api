// controllers/authController.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

function sign(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
}

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'username & password required' });

  const admin = await Admin.findOne({ username }).select('+password');
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await admin.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = sign(admin._id.toString());
  return res.json({
    status: 'success',
    token,
    admin: { id: admin._id, username: admin.username, name: admin.name, role: admin.role }
  });
}

module.exports = { login };

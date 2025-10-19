// routes/adminRoutes.js
const express = require('express');
const protect = require('../middleware/auth');
const { createRoute, createBus } = require('../controllers/adminController');
const router = express.Router();

router.post('/routes', protect, createRoute);
router.post('/buses', protect, createBus);

module.exports = router;

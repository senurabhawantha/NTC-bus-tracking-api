// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public (or Admin-only if you want to restrict registration)
 */
router.post('/register', optionalAuth, registerValidation, authController.register);

/**
 * @route   POST /auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', loginValidation, authController.login);

/**
 * @route   GET /auth/profile
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /auth/profile
 * @desc    Update current user profile
 * @access  Private (requires authentication)
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route   PUT /auth/change-password
 * @desc    Change user password
 * @access  Private (requires authentication)
 */
router.put('/change-password', authenticate, authController.changePassword);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh JWT token
 * @access  Private (requires valid token)
 */
router.post('/refresh', authenticate, authController.refreshToken);

module.exports = router;

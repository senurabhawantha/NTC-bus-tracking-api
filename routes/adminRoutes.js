// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const busController = require('../controllers/busController');
const routeController = require('../controllers/routeController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

// =====================
// USER MANAGEMENT ROUTES
// =====================

/**
 * @route   GET /admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Admin only
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   GET /admin/users/:id
 * @desc    Get user by ID
 * @access  Admin only
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @route   POST /admin/users
 * @desc    Create a new user
 * @access  Admin only
 */
router.post('/users', adminController.createUser);

/**
 * @route   PUT /admin/users/:id
 * @desc    Update user by ID
 * @access  Admin only
 */
router.put('/users/:id', adminController.updateUser);

/**
 * @route   DELETE /admin/users/:id
 * @desc    Delete user by ID
 * @access  Admin only
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * @route   PUT /admin/users/:id/reset-password
 * @desc    Reset user password
 * @access  Admin only
 */
router.put('/users/:id/reset-password', adminController.resetUserPassword);

// =====================
// BUS MANAGEMENT ROUTES
// =====================

/**
 * @route   POST /admin/buses
 * @desc    Create a new bus
 * @access  Admin only
 */
router.post('/buses', busController.createBus);

/**
 * @route   PUT /admin/buses/:bus_id
 * @desc    Update bus by ID
 * @access  Admin only
 */
router.put('/buses/:bus_id', busController.updateBus);

/**
 * @route   DELETE /admin/buses/:bus_id
 * @desc    Delete bus by ID
 * @access  Admin only
 */
router.delete('/buses/:bus_id', busController.deleteBus);

// =====================
// ROUTE MANAGEMENT ROUTES
// =====================

/**
 * @route   POST /admin/routes
 * @desc    Create a new route
 * @access  Admin only
 */
router.post('/routes', routeController.createRoute);

/**
 * @route   PUT /admin/routes/:route_id
 * @desc    Update route by ID
 * @access  Admin only
 */
router.put('/routes/:route_id', routeController.updateRoute);

/**
 * @route   DELETE /admin/routes/:route_id
 * @desc    Delete route by ID
 * @access  Admin only
 */
router.delete('/routes/:route_id', routeController.deleteRoute);

// =====================
// DASHBOARD STATS
// =====================

/**
 * @route   GET /admin/stats
 * @desc    Get dashboard statistics
 * @access  Admin only
 */
router.get('/stats', adminController.getDashboardStats);

module.exports = router;

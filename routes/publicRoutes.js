// routes/publicRoutes.js
const express = require('express');
const {
  getAllRoutes,
  getUpcomingTrips,
  getActiveTrips,
  getTrip,
  getBusLocation,
  getBusLocationHistory,
  getBusesNearby,
  getActiveLocations,
  getBusSummary
} = require('../controllers/publicController');

const router = express.Router();

router.get('/routes', getAllRoutes);
router.get('/routes/:route_id/trips/upcoming', getUpcomingTrips);

router.get('/trips/active', getActiveTrips);
router.get('/trips/:id', getTrip);

router.get('/buses/:bus_id', getBusSummary);
router.get('/buses/:bus_id/location', getBusLocation);
router.get('/buses/:bus_id/location/history', getBusLocationHistory);

router.get('/buses/nearby', getBusesNearby);
router.get('/locations/active', getActiveLocations);

module.exports = router;

// controllers/publicController.js
const Route = require('../models/route');
const Trip = require('../models/trip');
const Location = require('../models/location');
const Bus = require('../models/bus');

// GET /public/routes?from=&to=&page=&limit=
async function getAllRoutes(req, res) {
  const { from, to, page = 1, limit = 20 } = req.query;
  const q = {};
  // Your Route model commonly has { route_id, name } – we’ll filter by name for simplicity
  if (from) q.name = new RegExp(from, 'i');
  if (to)   q.name = new RegExp(to, 'i');
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Route.find(q).skip(skip).limit(Number(limit)),
    Route.countDocuments(q)
  ]);
  res.json({ status: 'success', data: items, meta: { total, page: Number(page), limit: Number(limit) } });
}

// GET /public/routes/:route_id/trips/upcoming
async function getUpcomingTrips(req, res) {
  const now = new Date();
  const route_id = Number(req.params.route_id);
  const trips = await Trip.find({
    route_id,
    startTime: { $gte: now },
    status: 'scheduled'
  }).sort({ startTime: 1 }).limit(50);
  res.json({ status: 'success', data: trips });
}

// GET /public/trips/active
async function getActiveTrips(_req, res) {
  const trips = await Trip.find({ status: 'active' }).sort({ startTime: -1 }).limit(100);
  res.json({ status: 'success', data: trips });
}

// GET /public/trips/:id
async function getTrip(req, res) {
  const t = await Trip.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Trip not found' });
  res.json({ status: 'success', data: t });
}

// GET /public/buses/:bus_id
async function getBusSummary(req, res) {
  const bus_id = Number(req.params.bus_id);
  const bus = await Bus.findOne({ bus_id });
  if (!bus) return res.status(404).json({ message: 'Bus not found' });

  const latestLoc = await Location.findOne({ bus_id }).sort({ timestamp: -1 });
  res.json({ status: 'success', data: { bus, latestLocation: latestLoc || null } });
}

// GET /public/buses/:bus_id/location
async function getBusLocation(req, res) {
  const bus_id = Number(req.params.bus_id);
  const latest = await Location.findOne({ bus_id }).sort({ timestamp: -1 });
  if (!latest) return res.status(404).json({ message: 'No location yet' });
  res.json({ status: 'success', data: latest });
}

// GET /public/buses/:bus_id/location/history?limit=50
async function getBusLocationHistory(req, res) {
  const bus_id = Number(req.params.bus_id);
  const limit = Math.min(Number(req.query.limit || 50), 500);
  const points = await Location.find({ bus_id }).sort({ timestamp: -1 }).limit(limit);
  res.json({ status: 'success', data: points });
}

// GET /public/buses/nearby?lat=&lng=&radiusKm=1
async function getBusesNearby(req, res) {
  const { lat, lng, radiusKm = 1 } = req.query;
  if (!lat || !lng) return res.status(400).json({ message: 'lat & lng required' });

  const radiusDeg = Number(radiusKm) / 111; // km -> ~degrees
  const minLat = Number(lat) - radiusDeg;
  const maxLat = Number(lat) + radiusDeg;
  const minLng = Number(lng) - radiusDeg;
  const maxLng = Number(lng) + radiusDeg;

  const points = await Location.find({
    'coordinate.latitude':  { $gte: minLat, $lte: maxLat },
    'coordinate.longitude': { $gte: minLng, $lte: maxLng }
  }).limit(200);

  res.json({ status: 'success', data: points });
}

// GET /public/locations/active
async function getActiveLocations(_req, res) {
  const pts = await Location.find({ isActive: true }).sort({ timestamp: -1 }).limit(500);
  res.json({ status: 'success', data: pts });
}

module.exports = {
  getAllRoutes,
  getUpcomingTrips,
  getActiveTrips,
  getTrip,
  getBusSummary,
  getBusLocation,
  getBusLocationHistory,
  getBusesNearby,
  getActiveLocations
};

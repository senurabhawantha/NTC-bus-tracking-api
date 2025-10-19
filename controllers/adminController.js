// controllers/adminController.js
const Route = require('../models/route');
const Bus = require('../models/bus');

// Create a route with your numeric style { route_id, name }
async function createRoute(req, res) {
  const { route_id, name } = req.body || {};
  if (route_id == null || !name) {
    return res.status(400).json({ message: 'route_id and name are required' });
  }
  const exists = await Route.findOne({ route_id: Number(route_id) });
  if (exists) return res.status(409).json({ message: 'route_id already exists' });

  const route = await Route.create({ route_id: Number(route_id), name });
  return res.status(201).json({ status: 'success', data: route });
}

// Create a bus with your numeric style { bus_id, route_id, plateNumber, capacity }
async function createBus(req, res) {
  const { bus_id, route_id, plateNumber, capacity } = req.body || {};
  if (bus_id == null) return res.status(400).json({ message: 'bus_id is required' });

  const exists = await Bus.findOne({ bus_id: Number(bus_id) });
  if (exists) return res.status(409).json({ message: 'bus_id already exists' });

  const bus = await Bus.create({
    bus_id: Number(bus_id),
    route_id: route_id != null ? Number(route_id) : undefined,
    plateNumber,
    capacity
  });

  return res.status(201).json({ status: 'success', data: bus });
}

module.exports = { createRoute, createBus };

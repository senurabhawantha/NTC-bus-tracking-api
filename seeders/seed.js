// seeders/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Admin = require('../models/admin');
const Route = require('../models/route');
const Bus = require('../models/bus');
const Trip = require('../models/trip');

(async () => {
  await connectDB();

  if (await Admin.countDocuments() === 0) {
    await Admin.create({ username: 'admin', password: 'admin123', name: 'Default Admin' });
    console.log('✓ Admin created: admin / admin123');
  }

  let r = await Route.findOne({ route_id: 1 });
  if (!r) r = await Route.create({ route_id: 1, name: 'Colombo – Kandy' });

  let b = await Bus.findOne({ bus_id: 1001 });
  if (!b) b = await Bus.create({ bus_id: 1001, route_id: 1, plateNumber: 'NC-1234', capacity: 45 });

  const start = new Date(Date.now() + 60 * 60 * 1000);
  await Trip.create({ route_id: 1, bus_id: 1001, startTime: start, status: 'scheduled' });

  await mongoose.connection.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });

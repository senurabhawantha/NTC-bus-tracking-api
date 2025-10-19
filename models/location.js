// models/location.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    bus_id: { type: Number, required: true, index: true },
    coordinate: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    speedKph: { type: Number, default: 0 },
    headingDeg: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Location || mongoose.model('Location', locationSchema);

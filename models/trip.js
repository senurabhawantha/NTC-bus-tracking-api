// models/trip.js
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    route_id: { type: Number, required: true, index: true }, // matches your numeric style
    bus_id:   { type: Number, required: true, index: true }, // matches your numeric style
    startTime: { type: Date, required: true },
    endTime:   { type: Date },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Trip || mongoose.model('Trip', tripSchema);

// controllers/busController.js
const Bus = require('../models/bus');

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate();
}

// GET /buses  (optional ?route_id=&date=YYYY-MM-DD)
async function getAllBuses(req, res) {
  try {
    const { route_id, date } = req.query;
    const query = route_id ? { route_id: Number(route_id) } : {};
    const buses = await Bus.find(query).lean();

    if (!date) {
      return res.json(buses.map(b => ({
        bus_id: b.bus_id,
        route_id: b.route_id,
        status: b.status,
        current_location: b.current_location,
        last_updated: b.last_updated
      })));
    }

    const target = new Date(date);
    if (isNaN(target.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const shaped = buses.map(b => {
      const day = (b.dailyLocations || []).find(x => isSameDay(x.date, target));
      if (day) {
        return {
          bus_id: b.bus_id,
          route_id: b.route_id,
          status: day.status,
          current_location: day.location,
          last_updated: day.date
        };
      }
      // fallback to current
      return {
        bus_id: b.bus_id,
        route_id: b.route_id,
        status: b.status,
        current_location: b.current_location,
        last_updated: b.last_updated
      };
    });

    res.json(shaped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// GET /buses/:bus_id
async function getBusById(req, res) {
  try {
    const bus = await Bus.findOne({ bus_id: Number(req.params.bus_id) }).lean();
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// GET /buses/:bus_id/location
async function getBusLocation(req, res) {
  try {
    const bus = await Bus.findOne({ bus_id: Number(req.params.bus_id) }).lean();
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus.current_location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// GET /buses/:bus_id/status
async function getBusStatus(req, res) {
  try {
    const bus = await Bus.findOne({ bus_id: Number(req.params.bus_id) }).lean();
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json({ status: bus.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

/**
 * PATCH /buses/:bus_id/location   (secured by x-api-key)
 * body: { latitude: number, longitude: number }
 */
async function updateBusLocation(req, res) {
  try {
    const bus_id = Number(req.params.bus_id);
    const { latitude, longitude } = req.body || {};
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ message: 'latitude and longitude (numbers) required' });
    }
    const bus = await Bus.findOne({ bus_id });
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    bus.current_location = { latitude, longitude };
    bus.last_updated = new Date();
    await bus.save();

    res.json({
      message: 'Location updated',
      bus_id,
      current_location: bus.current_location,
      last_updated: bus.last_updated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

/**
 * PATCH /buses/:bus_id/status     (secured by x-api-key)
 * body: { status: "On Time" | "Delayed" }
 */
async function updateBusStatus(req, res) {
  try {
    const bus_id = Number(req.params.bus_id);
    const { status } = req.body || {};
    if (!['On Time', 'Delayed'].includes(status)) {
      return res.status(400).json({ message: 'status must be "On Time" or "Delayed"' });
    }
    const bus = await Bus.findOne({ bus_id });
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    bus.status = status;
    bus.last_updated = new Date();
    await bus.save();

    res.json({
      message: 'Status updated',
      bus_id,
      status: bus.status,
      last_updated: bus.last_updated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

/**
 * POST /buses (admin only)
 * Create a new bus
 */
async function createBus(req, res) {
  try {
    const { bus_id, route_id, current_location, status, dailyLocations } = req.body;
    
    // Validate required fields
    if (!bus_id || !route_id) {
      return res.status(400).json({ 
        message: 'bus_id and route_id are required' 
      });
    }
    
    // Check if bus already exists
    const existingBus = await Bus.findOne({ bus_id: Number(bus_id) });
    if (existingBus) {
      return res.status(400).json({ 
        message: 'Bus with this ID already exists' 
      });
    }
    
    const busData = {
      bus_id: Number(bus_id),
      route_id: Number(route_id),
      current_location: current_location || { latitude: 0, longitude: 0 },
      status: status || 'On Time',
      last_updated: new Date()
    };
    
    if (dailyLocations) {
      busData.dailyLocations = dailyLocations;
    }
    
    const bus = new Bus(busData);
    await bus.save();
    
    res.status(201).json({
      message: 'Bus created successfully',
      bus
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error creating bus',
      error: err.message 
    });
  }
}

/**
 * PUT /buses/:bus_id (admin only)
 * Update entire bus record
 */
async function updateBus(req, res) {
  try {
    const bus_id = Number(req.params.bus_id);
    const { route_id, current_location, status, dailyLocations } = req.body;
    
    const bus = await Bus.findOne({ bus_id });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    // Update fields
    if (route_id !== undefined) bus.route_id = Number(route_id);
    if (current_location) bus.current_location = current_location;
    if (status) bus.status = status;
    if (dailyLocations) bus.dailyLocations = dailyLocations;
    
    bus.last_updated = new Date();
    await bus.save();
    
    res.json({
      message: 'Bus updated successfully',
      bus
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error updating bus',
      error: err.message 
    });
  }
}

/**
 * DELETE /buses/:bus_id (admin only)
 * Delete a bus
 */
async function deleteBus(req, res) {
  try {
    const bus_id = Number(req.params.bus_id);
    
    const bus = await Bus.findOneAndDelete({ bus_id });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    res.json({
      message: 'Bus deleted successfully',
      deletedBusId: bus_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error deleting bus',
      error: err.message 
    });
  }
}

module.exports = {
  getAllBuses,
  getBusById,
  getBusLocation,
  getBusStatus,
  updateBusLocation,
  updateBusStatus,
  createBus,
  updateBus,
  deleteBus,
};











// // controllers/busController.js
// const Bus = require('../models/bus');

// function isSameDay(a, b) {
//   const da = new Date(a), db = new Date(b);
//   return da.getFullYear() === db.getFullYear()
//     && da.getMonth() === db.getMonth()
//     && da.getDate() === db.getDate();
// }

// // GET /buses  (optional ?route_id=&date=YYYY-MM-DD)
// async function getAllBuses(req, res) {
//   try {
//     const { route_id, date } = req.query;
//     const query = route_id ? { route_id: Number(route_id) } : {};
//     const buses = await Bus.find(query).lean();

//     if (!date) {
//       return res.json(buses.map(b => ({
//         bus_id: b.bus_id,
//         route_id: b.route_id,
//         status: b.status,
//         current_location: b.current_location,
//         last_updated: b.last_updated
//       })));
//     }

//     const target = new Date(date);
//     if (isNaN(target.getTime())) {
//       return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
//     }

//     const shaped = buses.map(b => {
//       const day = (b.dailyLocations || []).find(x => isSameDay(x.date, target));
//       if (day) {
//         return {
//           bus_id: b.bus_id,
//           route_id: b.route_id,
//           status: day.status,
//           current_location: day.location,
//           last_updated: day.date
//         };
//       }
//       // fallback to current
//       return {
//         bus_id: b.bus_id,
//         route_id: b.route_id,
//         status: b.status,
//         current_location: b.current_location,
//         last_updated: b.last_updated
//       };
//     });

//     res.json(shaped);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// }

// // GET /buses/:bus_id
// async function getBusById(req, res) {
//   try {
//     const bus = await Bus.findOne({ bus_id: Number(req.params.bus_id) });
//     if (!bus) return res.status(404).json({ message: 'Bus not found' });
//     res.json(bus);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// }

// // GET /buses/:bus_id/location
// async function getBusLocation(req, res) {
//   try {
//     const bus = await Bus.findOne({ bus_id: Number(req.params.bus_id) });
//     if (!bus) return res.status(404).json({ message: 'Bus not found' });
//     res.json(bus.current_location);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// }

// // GET /buses/:bus_id/status
// async function getBusStatus(req, res) {
//   try {
//     const bus = await Bus.findOne({ bus_id: Number(req.params.bus_id) });
//     if (!bus) return res.status(404).json({ message: 'Bus not found' });
//     res.json({ status: bus.status });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// }

// module.exports = {
//   getAllBuses,
//   getBusById,
//   getBusLocation,
//   getBusStatus,
// };


// create-admin-user.js
require('dotenv').config();
const mongoose = require('mongoose');

let connectDB = require('./config/db');
if (typeof connectDB !== 'function' && connectDB && typeof connectDB.connectDB === 'function') {
  connectDB = connectDB.connectDB;
}

const Admin = require('./models/admin');

(async () => {
  try {
    await connectDB();

    const username = process.argv[2];           // required
    const password = process.argv[3] || 'pass'; // default if not given
    const name = process.argv[4] || 'Admin';

    if (!username) {
      console.error('Usage: node create-admin-user.js <username> [password] [name]');
      process.exit(1);
    }

    const exists = await Admin.findOne({ username });
    if (exists) {
      console.error(`❌ Username "${username}" already exists`);
      process.exit(1);
    }

    const a = await Admin.create({ username, password, name });
    console.log('✅ Admin created:', a.username);
  } catch (e) {
    console.error('❌ Failed:', e.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();

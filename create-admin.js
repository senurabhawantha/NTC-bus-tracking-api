require('dotenv').config();
const mongoose = require('mongoose');

// ⬇️ import your DB connector correctly (covers both export styles)
let connectDB = require('./config/db');
if (typeof connectDB !== 'function' && connectDB && typeof connectDB.connectDB === 'function') {
  connectDB = connectDB.connectDB;
}

const Admin = require('./models/admin');

(async () => {
  try {
    await connectDB();
    const a = await Admin.create({
      username: 'admin',
      password: 'admin123',
      name: 'Default Admin'
    });
    console.log('✅ Admin created:', a.username);
  } catch (e) {
    console.error('❌ Failed:', e.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();

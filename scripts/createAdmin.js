// scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function createAdmin() {
  try {
    // Get MongoDB URI
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/bus_tracking';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4,
    });
    
    console.log('Connected to MongoDB');
    
    // Admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bustrack.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminName = process.env.ADMIN_NAME || 'System Admin';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`❌ Admin user with email ${adminEmail} already exists.`);
      console.log('If you want to reset the password, delete the user first or use a different email.');
      process.exit(0);
    }
    
    // Create admin user
    const admin = new User({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'admin',
      isActive: true
    });
    
    await admin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: admin');
    console.log('-----------------------------------');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdmin();

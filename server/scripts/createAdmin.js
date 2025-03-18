const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// MongoDB connection string - you can modify this as needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/photo-op';

// Admin user configuration
const adminConfig = {
  email: process.argv[2] || 'admin@photo-op.com',
  password: process.argv[3] || 'Admin123!@#',
  name: 'Admin User',
  role: 'admin'
};

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminConfig.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create new admin user
    const adminUser = new User(adminConfig);
    await adminUser.save();

    console.log('Admin user created successfully:');
    console.log('Email:', adminConfig.email);
    console.log('Password:', adminConfig.password);
    console.log('Please change the password after first login');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createAdminUser(); 
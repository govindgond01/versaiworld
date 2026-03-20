const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin(email, name, password) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️ Admin already exists:', email);
      process.exit();
      return;
    }
    
    // Create admin - CLEAN, NO STUDENT FIELDS
    const admin = await User.create({
      name: name || 'Admin User',
      email: email,
      password: await bcrypt.hash(password || 'Admin@123', 10),
      phone: '9876543210',
      userType: 'admin',  // 👈 SIRF ADMIN
      status: 'active',
      isActive: true
      // ⚠️ KOI STUDENT FIELD NAHI
    });
    
    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', password || 'Admin@123');
    console.log('🆔 User ID:', admin.userId);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

// Run: node scripts/createAdmin.js email@example.com "Name" "Password"
const [,, email, name, password] = process.argv;

if (!email) {
  console.log('Usage: node createAdmin.js email@example.com "Name" "Password"');
  process.exit(1);
}

createAdmin(email, name, password);
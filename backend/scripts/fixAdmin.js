const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const result = await User.updateOne(
      { email: 'admin@gmail.com' },
      { 
        $unset: { 
          studentCategory: 1,
          course: 1,
          fees: 1,
          admissionDate: 1,
          membershipDuration: 1,
          endDate: 1,
          batch: 1
        }
      }
    );
    
    console.log('✅ Admin fixed:', result);
    
    const admin = await User.findOne({ email: 'admin@gmail.com' }).lean();
    console.log('Admin now has fields:', Object.keys(admin));
    
    await mongoose.disconnect();
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdmin();
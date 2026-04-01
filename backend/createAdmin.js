const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@Clothify.com' });
    if (existing) {
      console.log('✅ Admin already exists!');
      console.log('📧 Email: admin@Clothify.com');
      console.log('🔑 Password: admin123');
      process.exit();
    }

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@Clothify.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@Clothify.com');
    console.log('🔑 Password: admin123');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
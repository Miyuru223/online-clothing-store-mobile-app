const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const reset = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Delete old admin and recreate
  await User.deleteOne({ email: 'admin@Clothify.com' });
  
  await User.create({
    name: 'Admin',
    email: 'admin@Clothify.com',
    password: 'admin123',
    role: 'admin',
  });

  console.log('✅ Admin reset successfully!');
  console.log('📧 Email: admin@Clothify.com');
  console.log('🔑 Password: admin123');
  process.exit();
};

reset();
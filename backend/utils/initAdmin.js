const User = require('../models/User');

const initAdmin = async () => {
  try {
    const adminEmail = 'chaudharyaleena29@gmail.com';
    const adminPassword = 'aleena123';

    // Check if admin already exists
    const adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
      });
      console.log('🛡️ Fixed Admin account created successfully.');
    } else {
      // Ensure the role is admin in case it was modified
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('🛡️ Fixed Admin account restored role to admin.');
      }
    }
  } catch (error) {
    console.error('❌ Error initializing admin:', error.message);
  }
};

module.exports = initAdmin;

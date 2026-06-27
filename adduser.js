const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/securitygard').then(async () => {
  const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    flatNo: String,
    memberId: String,
    role: { type: String, default: 'user' }
  });

  const User = mongoose.model('User', userSchema);

  // Change these details as you want
  const hashed = await bcrypt.hash('user123', 10);
  await User.create({
    name: 'Test User',
    email: 'user@society.com',
    password: hashed,
    phone: '9876543210',
    flatNo: 'A-101',
    memberId: 'MEM001',
    role: 'user'
  });

  console.log('✅ User created!');
  console.log('   Email:    user@society.com');
  console.log('   Password: user123');
  process.exit();
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit();
});

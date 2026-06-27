const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/securitygard').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String, name: String }));
  const users = await User.find();
  console.log('Total users:', users.length);
  users.forEach(u => console.log(' -', u.email, '|', u.role, '|', u.name));
  process.exit();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit();
});

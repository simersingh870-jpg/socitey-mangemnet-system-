// server.js - Fixed Version

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const app = express();

// Default port is separate from the user app to avoid conflicts
const PORT = process.env.PORT || 5501;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/securitygard';
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3000';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log(`✅ MongoDB connected: ${MONGODB_URI}`))
  .catch(err => {
    console.error('❌ MongoDB Error:', err);
  });

// Schemas
const entrySchema = new mongoose.Schema({
  vehicleNumber: String,
  visitorName: String,
  flatNumber: String,
  phone: String,
  personType: String,
  personLabel: String,
  type: String,
  purpose: String,
  gate: String,
  remarks: String,
  timestamp: { type: Number, default: () => Date.now() },
  time: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  phoneNo: String,
  flatDetail: String,
  members: Number,
  details: String,
  registrationTime: { type: Date, default: Date.now }
});

const memberVehicleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerName: String,
  flatNumber: String,
  vehicleNumber: { type: String, required: true, unique: true },
  vehicleType: { type: String, enum: ['car', 'bike', 'scooter'], default: 'car' },
  registrationDate: { type: Date, default: Date.now }
});

const Entry = mongoose.model('Entry', entrySchema);
const User = mongoose.model('User', userSchema);
const MemberVehicle = mongoose.model('MemberVehicle', memberVehicleSchema);

// ================= ROUTES =================

// Add Entry
app.post('/add', async (req, res) => {
  try {
    const {
      vehicleNumber,
      visitorName,
      flatNumber,
      phone,
      personType,
      personLabel,
      type,
      purpose,
      gate,
      remarks,
      timestamp
    } = req.body;

    const newEntry = new Entry({
      vehicleNumber,
      visitorName,
      flatNumber,
      phone,
      personType,
      personLabel,
      type,
      purpose,
      gate,
      remarks,
      timestamp
    });

    await newEntry.save();

    // Also save to admin visitor when this is a visitor log
    if (visitorName && flatNumber) {
      try {
        await axios.post(`${ADMIN_API_URL}/api/visitors`, {
          name: visitorName,
          flatNo: flatNumber,
          purpose: purpose
        }, { timeout: 5000 });
      } catch (adminErr) {
        console.error('Failed to save to admin:', adminErr.message);
      }
    }

    res.json({ message: 'Entry Saved', data: newEntry });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Entries
app.get('/all', async (req, res) => {
  const data = await Entry.find().sort({ time: -1 });
  res.json(data);
});

// Check Member Vehicle - uses admin DB via API lookup
app.post('/check-vehicle', async (req, res) => {
  try {
    const { vehicleNumber } = req.body;
    if (!vehicleNumber) return res.status(400).json({ error: 'Vehicle number is required' });

    const reg = vehicleNumber.toUpperCase();

    // First try admin API for full resident info
    try {
      const response = await axios.get(`${ADMIN_API_URL}/api/vehicles/lookup/${reg}`, { timeout: 5000 });
      const { vehicle, owner } = response.data;
      return res.json({
        status: 'member',
        type: 'allowed',
        ownerName: owner?.name || vehicle.userName,
        flatNumber: owner?.flatNo || vehicle.flatNo,
        vehicleType: vehicle.type,
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        vehicleColor: vehicle.color,
        phone: owner?.phone,
        memberId: owner?.memberId,
        message: `✅ Member vehicle - Owner: ${owner?.name || vehicle.userName}, Flat: ${owner?.flatNo || vehicle.flatNo}`
      });
    } catch (adminErr) {
      // Vehicle not found in admin DB - log as visitor
      const visitorEntry = new Entry({
        vehicleNumber: reg,
        visitorName: 'Unknown Visitor',
        flatNumber: 'Visitor',
        purpose: 'Vehicle Entry Check'
      });
      await visitorEntry.save();
      return res.json({
        status: 'visitor',
        type: 'logged',
        message: `🚗 Visitor vehicle logged - Entry time: ${visitorEntry.time}`,
        entryId: visitorEntry._id
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register User
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, phoneNo, flatDetail, members } = req.body;

    if (!email || !password) {
      return res.json({ message: 'Required fields missing' });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      phoneNo,
      flatDetail,
      members
    });

    await user.save();

    res.json({ message: 'User Registered' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SERVER START =================

// 🔥 SMART LISTEN (auto fix port issue)
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} busy, trying 5502...`);
    app.listen(5502, () => {
      console.log(`✅ Server running on http://localhost:5502`);
    });
  } else {
    console.error(err);
  }
});
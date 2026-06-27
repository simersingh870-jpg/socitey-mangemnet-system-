const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/securitygard';

const maintenanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  flatNo: String,
  type: String,
  desc: String,
  priority: String,
  date: String,
  status: String
}, { timestamps: true });

const complaintSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  flatNo: String,
  category: String,
  subject: String,
  details: String,
  against: String,
  status: String
}, { timestamps: true });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const maint = await Maintenance.find().limit(5).lean();
    const comps = await Complaint.find().limit(5).lean();
    console.log(JSON.stringify({ maint, comps }, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

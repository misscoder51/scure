const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  type:      { type: String, enum: ['appointment', 'prescription', 'reminder', 'system', 'emergency'], default: 'system' },
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  read:      { type: Boolean, default: false },
  link:      { type: String },
  createdAt: { type: String }
});

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:   { type: String, required: true },
  lastName:    { type: String, required: true },
  username:    { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'doctor', 'pharmacist', 'admin'],
    default: 'student'
  },
  studentId:   { type: String },
  department:  { type: String },
  phone:       { type: String },
  isAvailable: { type: Boolean, default: true },
  createdAt:   { type: String }
});

module.exports = mongoose.model('User', userSchema);

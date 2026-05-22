const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  studentName:   { type: String, required: true },
  studentId:     { type: String },
  studentID:     { type: String, required: true },
  selectedDate:  { type: String, required: true },
  selectedTime:  { type: String, required: true },
  selectedDoctor:{ type: String, required: true },
  doctorId:      { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['in-person', 'video'],
    default: 'in-person'
  },
  reason:         { type: String },
  roomId:         { type: String },
  notes:          { type: String },
  doctorNotes:    { type: String },
  prescriptionId: { type: String },
  createdAt:      { type: String }
});

module.exports = mongoose.model('Appointment', appointmentSchema);

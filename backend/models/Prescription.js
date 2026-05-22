const mongoose = require('mongoose');
const mongooseFieldEncryption = require('mongoose-field-encryption').fieldEncryption;
const medicineSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  dosage:      { type: String },
  frequency:   { type: String },
  duration:    { type: String },
  instructions:{ type: String }
});

const prescriptionSchema = new mongoose.Schema({
  appointmentId:    { type: String },
  doctorId:         { type: String, required: true },
  doctorName:       { type: String },
  patientId:        { type: String, required: true },
  patientName:      { type: String },
  patientStudentId: { type: String },
  medicines:        [medicineSchema],
  instructions:     { type: String },
  followUpDate:     { type: String },
  status: {
    type: String,
    enum: ['active', 'dispensed', 'expired'],
    default: 'active'
  },
  dispensedAt:  { type: String },
  dispensedBy:  { type: String },
  createdAt:    { type: String }
});

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'scure_super_secret_encryption_key_32_bytes!';

prescriptionSchema.plugin(mongooseFieldEncryption, {
  fields: ['medicines', 'instructions'],
  secret: ENCRYPTION_SECRET,
  saltGenerator: function (secret) {
    return '1234567890123456'; // 16 bytes salt
  }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);

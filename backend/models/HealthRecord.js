const mongoose = require('mongoose');
const mongooseFieldEncryption = require('mongoose-field-encryption').fieldEncryption;
const healthRecordSchema = new mongoose.Schema({
  studentId:   { type: String, required: true },
  studentName: { type: String },
  date:        { type: String },
  doctorId:    { type: String },
  doctorName:  { type: String },
  symptoms:    [{ type: String }],
  diagnosis:   { type: String },
  prescriptionId: { type: String },
  notes:       { type: String },
  vitals: {
    heartRate:     { type: String },
    bloodPressure: { type: String },
    temperature:   { type: String },
    weight:        { type: String }
  },
  createdAt:   { type: String }
});

// Use a placeholder secure key (32 bytes)
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'scure_super_secret_encryption_key_32_bytes!';

healthRecordSchema.plugin(mongooseFieldEncryption, {
  fields: ['symptoms', 'diagnosis', 'notes', 'vitals'],
  secret: ENCRYPTION_SECRET,
  saltGenerator: function (secret) {
    return '1234567890123456'; // 16 bytes salt
  }
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);

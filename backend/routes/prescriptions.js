const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');

// GET all prescriptions (optionally filter by patientId or doctorId)
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId, status } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;
    const prescriptions = await Prescription.find(query);
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single prescription
router.get('/:id', async (req, res) => {
  try {
    const p = await Prescription.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Prescription not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create prescription (by doctor)
router.post('/', async (req, res) => {
  try {
    const prescription = new Prescription({
      ...req.body,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    const saved = await prescription.save();

    // Update appointment with prescriptionId
    if (req.body.appointmentId) {
      const apt = await Appointment.findById(req.body.appointmentId);
      if (apt) {
        apt.prescriptionId = saved._id;
        apt.status = 'completed';
        await apt.save();
      }
    }

    // Notify patient
    if (req.body.patientId) {
      const notif = new Notification({
        userId: req.body.patientId,
        type: 'prescription',
        title: 'New Prescription Issued',
        message: `Dr. ${req.body.doctorName || 'your doctor'} has issued a prescription. Visit the dispensary for pickup.`,
        read: false,
        link: '/prescriptions',
        createdAt: new Date().toISOString()
      });
      await notif.save();

      // Emit via Socket.io if available
      if (req.app.get('io')) {
        req.app.get('io').to(`user_${req.body.patientId}`).emit('notification', {
          title: 'New Prescription Issued',
          message: `Dr. ${req.body.doctorName || 'your doctor'} has issued a prescription.`,
          type: 'prescription'
        });
      }
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update prescription status (pharmacist marks dispensed)
router.patch('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

    if (req.body.status) prescription.status = req.body.status;
    if (req.body.dispensedAt) prescription.dispensedAt = req.body.dispensedAt;
    if (req.body.dispensedBy) prescription.dispensedBy = req.body.dispensedBy;

    const updated = await prescription.save();

    // Notify patient when dispensed
    if (req.body.status === 'dispensed' && prescription.patientId) {
      const notif = new Notification({
        userId: prescription.patientId,
        type: 'prescription',
        title: 'Prescription Dispensed',
        message: `Your prescription has been dispensed. Please collect your medicines from the dispensary.`,
        read: false,
        link: '/prescriptions',
        createdAt: new Date().toISOString()
      });
      await notif.save();

      if (req.app.get('io')) {
        req.app.get('io').to(`user_${prescription.patientId}`).emit('notification', {
          title: 'Prescription Dispensed',
          message: 'Your prescription medicines are ready for pickup.',
          type: 'prescription'
        });
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

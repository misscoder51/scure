const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// GET all appointments (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { studentId, doctorId, status, date } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (doctorId)  query.doctorId  = doctorId;
    if (status)    query.status    = status;
    if (date)      query.selectedDate = date;
    const appointments = await Appointment.find(query);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single appointment
router.get('/:id', async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ message: 'Appointment not found' });
    res.json(apt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create appointment
router.post('/', async (req, res) => {
  try {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const appointment = new Appointment({
      ...req.body,
      status: 'pending',
      roomId,
      createdAt: new Date().toISOString()
    });
    const newAppointment = await appointment.save();

    // Notify student if studentId provided
    if (req.body.studentId) {
      const notif = new Notification({
        userId: req.body.studentId,
        type: 'appointment',
        title: 'Appointment Requested',
        message: `Your appointment with ${req.body.selectedDoctor} on ${req.body.selectedDate} at ${req.body.selectedTime} is pending confirmation.`,
        read: false,
        link: '/student-dashboard',
        createdAt: new Date().toISOString()
      });
      await notif.save();
    }

    // Notify via Socket.io
    if (req.app.get('io') && req.body.doctorId) {
      req.app.get('io').to(`user_${req.body.doctorId}`).emit('new-appointment', newAppointment);
    }

    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update appointment (status, notes, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ message: 'Appointment not found' });

    const oldStatus = apt.status;
    Object.assign(apt, req.body);
    const updated = await apt.save();

    // If status changed to confirmed, notify student
    if (req.body.status === 'confirmed' && oldStatus !== 'confirmed' && apt.studentId) {
      const notif = new Notification({
        userId: apt.studentId,
        type: 'appointment',
        title: 'Appointment Confirmed ✓',
        message: `Your appointment with ${apt.selectedDoctor} on ${apt.selectedDate} at ${apt.selectedTime} is confirmed.`,
        read: false,
        link: '/student-dashboard',
        createdAt: new Date().toISOString()
      });
      await notif.save();

      if (req.app.get('io')) {
        req.app.get('io').to(`user_${apt.studentId}`).emit('notification', {
          title: 'Appointment Confirmed',
          message: `Your appointment with ${apt.selectedDoctor} is confirmed.`,
          type: 'appointment'
        });
        req.app.get('io').to(`user_${apt.studentId}`).emit('appointment-update', updated);
      }
    }

    // If cancelled, notify student
    if (req.body.status === 'cancelled' && apt.studentId) {
      const notif = new Notification({
        userId: apt.studentId,
        type: 'appointment',
        title: 'Appointment Cancelled',
        message: `Your appointment with ${apt.selectedDoctor} on ${apt.selectedDate} has been cancelled.`,
        read: false,
        link: '/student-dashboard',
        createdAt: new Date().toISOString()
      });
      await notif.save();
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE cancel appointment
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

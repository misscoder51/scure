const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET notifications for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const notifications = await Notification.find({ userId });
    // Sort by createdAt desc (most recent first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create notification
router.post('/', async (req, res) => {
  try {
    const notif = new Notification({
      ...req.body,
      createdAt: new Date().toISOString(),
      read: false
    });
    const saved = await notif.save();

    // Emit via Socket.io
    if (req.app.get('io') && req.body.userId) {
      req.app.get('io').to(`user_${req.body.userId}`).emit('notification', {
        title: req.body.title,
        message: req.body.message,
        type: req.body.type
      });
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST broadcast to all users (admin emergency)
router.post('/broadcast', async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'title and message required' });

    // Emit to all connected clients
    if (req.app.get('io')) {
      req.app.get('io').emit('broadcast', { title, message, type: 'emergency' });
    }

    res.json({ message: 'Broadcast sent to all users' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    notif.read = true;
    await notif.save();
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH mark all read for a user
router.patch('/read-all/:userId', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.params.userId, read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

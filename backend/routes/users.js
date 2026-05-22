const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users (with optional role filter)
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query);
    // Never return passwords
    const safeUsers = users.map(u => ({
      _id: u._id, firstName: u.firstName, lastName: u.lastName,
      username: u.username, role: u.role, department: u.department,
      studentId: u.studentId, phone: u.phone, isAvailable: u.isAvailable,
      createdAt: u.createdAt
    }));
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safeUser } = { ...user };
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update user
router.patch('/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', userId: updated._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

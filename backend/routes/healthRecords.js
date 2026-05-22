const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');

// GET health records for a student
router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = studentId ? { studentId } : {};
    const records = await HealthRecord.find(query);
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single health record
router.get('/:id', async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create health record (by doctor after consultation)
router.post('/', async (req, res) => {
  try {
    const record = new HealthRecord({
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });
    const saved = await record.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update record
router.patch('/:id', async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    Object.assign(record, req.body);
    const updated = await record.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Inventory = require('../models/MedicineInventory');
const Notification = require('../models/Notification');

// GET all inventory
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add new medicine
router.post('/', async (req, res) => {
  try {
    const item = new Inventory({ ...req.body, createdAt: new Date().toISOString() });
    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update stock / details
router.patch('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    Object.assign(item, req.body);
    const updated = await item.save();

    // Check if low stock after update
    if (updated.stock <= updated.minStock) {
      if (req.app.get('io')) {
        req.app.get('io').emit('low-stock-alert', {
          medicine: updated.name,
          stock: updated.stock,
          minStock: updated.minStock
        });
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE remove medicine
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Inventory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Medicine removed from inventory' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET low-stock alerts
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const all = await Inventory.find();
    const lowStock = all.filter(item => item.stock <= item.minStock);
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

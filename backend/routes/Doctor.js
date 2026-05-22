const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Add a new doctor
router.post('/', async (req, res) => {
    try {
        const { name, specialization, email } = req.body;

        const doctor = new Doctor({
            name,
            specialization,
            email,
        });

        const newDoctor = await doctor.save();
        res.status(201).json(newDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all doctors
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

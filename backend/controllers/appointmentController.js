const Appointment = require('../models/Appointment');


exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createAppointment = async (req, res) => {
    const appointment = new Appointment({
        studentName: req.body.studentName,
        studentID: req.body.studentID,
        selectedDate: req.body.selectedDate,
        selectedTime: req.body.selectedTime,
        selectedDoctor:req.body.selectedDoctor

    });

    try {
        const newAppointment = await appointment.save();
        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


exports.deleteAppointment = async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Appointment deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

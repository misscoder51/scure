import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Zap, CheckCircle, AlertTriangle, X } from 'lucide-react';

const AppointmentScheduler = () => {
  const [studentName, setStudentName] = useState('');
  const [studentID, setStudentID]     = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [message, setMessage]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5001/doctors')
      .then((r) => setDoctors(r.data))
      .catch(console.error);
  }, []);

  const handleScheduleAppointment = () => {
    if (!studentName || !studentID || !selectedDate || !selectedTime || !selectedDoctor) {
      setMessage('Please fill out all required fields.'); setSuccess(false); setShowModal(true); return;
    }
    setIsLoading(true);
    axios.post('http://localhost:5001/appointments', { studentName, studentID, selectedDate, selectedTime, selectedDoctor })
      .then((r) => {
        setMessage(`Appointment confirmed with Dr. ${r.data.selectedDoctor} on ${r.data.selectedDate} at ${r.data.selectedTime}.`);
        setSuccess(true); setShowModal(true);
        setStudentName(''); setStudentID(''); setSelectedDate(''); setSelectedTime(''); setSelectedDoctor('');
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || `Error: ${err.message}`);
        setSuccess(false); setShowModal(true);
      })
      .finally(() => setIsLoading(false));
  };

  const fieldStyle = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
    padding: '13px 18px 13px 44px', fontSize: '0.9rem',
    color: '#e2e8f0', outline: 'none', fontFamily: 'inherit',
    transition: 'all 0.25s ease',
  };

  const plainFieldStyle = { ...fieldStyle, paddingLeft: '18px' };

  const labelStyle = {
    display: 'block', color: 'rgba(148,163,184,0.6)',
    fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em',
    textTransform: 'uppercase', marginBottom: 8,
  };

  const onFocus = (e) => { e.target.style.borderColor = 'rgba(249,168,212,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,168,212,0.1)'; };
  const onBlur  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{
        width: '100%', maxWidth: 680,
        background: 'rgba(6,9,20,0.85)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(249,168,212,0.15)', borderRadius: 24,
        padding: '2.5rem',
        boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(249,168,212,0.06)',
        animation: 'fade-up 0.5s ease both',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg, #f9a8d4, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 30px rgba(249,168,212,0.4)',
          }}>
            <Calendar size={26} color="#fff" />
          </div>
          <h2 style={{ color: '#f8fafc', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            Schedule a Consultation
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.9rem', margin: 0 }}>
            Reserve dedicated time slots with campus physicians instantly
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Name + ID Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Patient Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
                <input id="sched-name" type="text" placeholder="Your full name"
                  value={studentName} onChange={(e) => setStudentName(e.target.value)}
                  style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>University ID</label>
              <input id="sched-id" type="text" placeholder="e.g. 2026CSE100"
                value={studentID} onChange={(e) => setStudentID(e.target.value)}
                style={plainFieldStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Date + Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Preferred Date</label>
              <input id="sched-date" type="date"
                value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                style={{ ...plainFieldStyle, colorScheme: 'dark' }} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={labelStyle}>Preferred Time</label>
              <input id="sched-time" type="time"
                value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}
                style={{ ...plainFieldStyle, colorScheme: 'dark' }} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Doctor Select */}
          <div>
            <label style={labelStyle}>Select Practitioner</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
              <select id="sched-doctor" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}
                style={{ ...fieldStyle, appearance: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.04)' }}
                onFocus={onFocus} onBlur={onBlur}
              >
                <option value="">Choose a campus physician</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc.name}>{doc.name} — {doc.specialty || 'General Practitioner'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <button type="button" className="btn-cyber-primary" onClick={handleScheduleAppointment} disabled={isLoading}
            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: 4, opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? (
              <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'rotate-slow 0.8s linear infinite' }} />Processing...</>
            ) : (
              <><Zap size={16} /> Confirm Appointment</>
            )}
          </button>
        </div>
      </div>

      {/* Dark Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            width: '100%', maxWidth: 420,
            background: 'rgba(6,9,20,0.95)', backdropFilter: 'blur(24px)',
            border: `1px solid ${success ? 'rgba(251,207,232,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 20, padding: '1.75rem',
            boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
            animation: 'fade-up 0.3s ease both',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {success ? <CheckCircle size={22} style={{ color: '#fbcfe8' }} /> : <AlertTriangle size={22} style={{ color: '#f9a8d4' }} />}
                <h5 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1rem', margin: 0 }}>
                  {success ? 'Appointment Confirmed' : 'Action Required'}
                </h5>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.25rem' }}>{message}</p>
            <button onClick={() => setShowModal(false)} className="btn-cyber-secondary" style={{ width: '100%', padding: '10px' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduler;

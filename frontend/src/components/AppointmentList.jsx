import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, User, Activity, Inbox, ArrowRight } from 'lucide-react';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get('https://scure-backend.onrender.com/appointments')
      .then((r) => setAppointments(r.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem clamp(1rem, 3vw, 2rem)' }}>

      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="neon-badge neon-badge-cyan" style={{ marginBottom: '0.75rem' }}>Live Queue</div>
        <h2 style={{ color: '#f8fafc', fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.02em', margin: '0 0 0.75rem' }}>
          Campus Appointment Queue
        </h2>
        <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.95rem', maxWidth: 500, margin: '0 auto' }}>
          Active consultation bookings registered with university dispensary practitioners
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(249,168,212,0.2)', borderTopColor: '#f9a8d4', animation: 'rotate-slow 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.85rem' }}>Fetching active queue...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem', maxWidth: 400, margin: '0 auto',
          background: 'rgba(6,9,20,0.7)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Inbox size={28} style={{ color: 'rgba(148,163,184,0.3)' }} />
          </div>
          <div>
            <h4 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 8px' }}>No active bookings</h4>
            <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
              No appointments in the system. Book one to get started.
            </p>
            <Link to="/appointment-scheduler" className="btn-cyber-primary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '0.85rem' }}>
              <ArrowRight size={14} /> Book Appointment
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {appointments.map((apt) => (
            <div key={apt._id || apt.id} style={{
              background: 'rgba(6,9,20,0.7)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '1rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(249,168,212,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(249,168,212,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Doctor Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(249,168,212,0.12)', border: '1px solid rgba(249,168,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={20} style={{ color: '#f9a8d4' }} />
                  </div>
                  <div>
                    <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.95rem' }}>
                      Dr. {apt.selectedDoctor || 'Campus Physician'}
                    </div>
                    <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem' }}>On-Campus Practitioner</div>
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 800,
                  background: 'rgba(251,207,232,0.1)', border: '1px solid rgba(251,207,232,0.25)', color: '#fbcfe8',
                }}>
                  Confirmed
                </span>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: <User size={13} />, label: apt.studentName || 'Patient', color: '#f9a8d4' },
                  { icon: <Calendar size={13} />, label: apt.selectedDate || '—', color: '#d8b4fe' },
                  { icon: <Clock size={13} />, label: apt.selectedTime || '—', color: '#fbcfe8' },
                ].map((detail) => (
                  <div key={detail.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ color: detail.color }}>{detail.icon}</span>
                    <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.83rem' }}>{detail.label}</span>
                  </div>
                ))}
              </div>

              {/* Student ID */}
              {apt.studentID && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                  <span style={{ color: 'rgba(148,163,184,0.4)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>ID:</span>
                  <span style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.78rem', marginLeft: 8, fontFamily: 'monospace' }}>{apt.studentID}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;

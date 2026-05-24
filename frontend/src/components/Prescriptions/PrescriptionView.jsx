import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, Calendar, Clock, CheckCircle, Bell, BellOff, FileText, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const BASE = 'https://scure-backend.onrender.com';
const REMINDER_KEY = 'scure_reminders';

const statusStyle = {
  active:    { bg: 'rgba(249,168,212,0.1)', border: 'rgba(249,168,212,0.3)', color: '#f9a8d4' },
  dispensed: { bg: 'rgba(251,207,232,0.1)', border: 'rgba(251,207,232,0.3)', color: '#fbcfe8' },
  expired:   { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', color: '#94a3b8' },
};

const PrescriptionView = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem(REMINDER_KEY) || '{}'); } catch { return {}; }
  });
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!user) return;
    axios.get(`${BASE}/prescriptions?patientId=${user._id}`)
      .then(r => setPrescriptions(r.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user]);

  const filtered = prescriptions.filter(p => activeTab === 'all' || p.status === activeTab);

  const toggleReminder = (rxId, medName) => {
    const key = `${rxId}_${medName}`;
    if (Notification && Notification.permission === 'default') Notification.requestPermission();
    const updated = { ...reminders, [key]: !reminders[key] };
    setReminders(updated);
    localStorage.setItem(REMINDER_KEY, JSON.stringify(updated));
    if (updated[key] && Notification && Notification.permission === 'granted') {
      new Notification('S-Cure Medicine Reminder Set', { body: `Reminder active for: ${medName}` });
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const tabs = ['all', 'active', 'dispensed', 'expired'];

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem clamp(1rem, 3vw, 2rem)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #d8b4fe, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 30px rgba(216,180,254,0.4)' }}>
          <Pill size={28} color="#fff" />
        </div>
        <h2 style={{ color: '#f8fafc', fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>My Prescriptions</h2>
        <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.95rem', margin: 0 }}>All prescriptions issued by campus physicians</p>
      </div>

      {/* Tab Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 18px', borderRadius: 999, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, textTransform: 'capitalize', transition: 'all 0.2s ease',
              background: activeTab === tab ? 'linear-gradient(135deg, #f9a8d4, #d8b4fe)' : 'rgba(255,255,255,0.04)',
              color: activeTab === tab ? '#fff' : 'rgba(148,163,184,0.6)',
              border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: activeTab === tab ? '0 0 15px rgba(249,168,212,0.3)' : 'none',
            }}>
            {tab} {tab !== 'all' && `(${prescriptions.filter(p => p.status === tab).length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(216,180,254,0.2)', borderTopColor: '#d8b4fe', animation: 'rotate-slow 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.85rem' }}>Loading prescriptions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(6,9,20,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20 }}>
          <FileText size={40} style={{ color: 'rgba(148,163,184,0.2)', marginBottom: '1rem' }} />
          <h4 style={{ color: '#e2e8f0', fontWeight: 700, margin: '0 0 8px' }}>No prescriptions found</h4>
          <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>Book an appointment to get a prescription from a campus physician.</p>
          <Link to="/appointment-scheduler" className="btn-cyber-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>Book Appointment</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((rx) => {
            const s = statusStyle[rx.status] || statusStyle.active;
            const isOpen = expanded[rx._id];
            return (
              <div key={rx._id} style={{ background: 'rgba(6,9,20,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${s.color}`, borderRadius: 20, overflow: 'hidden', transition: 'all 0.3s ease' }}>
                {/* Card Header */}
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleExpand(rx._id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `${s.bg}`, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pill size={20} style={{ color: s.color }} />
                    </div>
                    <div>
                      <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.95rem' }}>{rx.doctorName || 'Campus Physician'}</div>
                      <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Calendar size={12} />{rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : rx.createdAt}
                        {rx.medicines?.length > 0 && <><span style={{ opacity: 0.3 }}>·</span>{rx.medicines.length} medicine{rx.medicines.length !== 1 ? 's' : ''}</>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{rx.status}</span>
                    {isOpen ? <ChevronUp size={18} style={{ color: 'rgba(148,163,184,0.4)' }} /> : <ChevronDown size={18} style={{ color: 'rgba(148,163,184,0.4)' }} />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isOpen && (
                  <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Medicines */}
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Medicines</div>
                      {(rx.medicines || []).map((med, i) => {
                        const remKey = `${rx._id}_${med.name}`;
                        const hasReminder = reminders[remKey];
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Pill size={14} style={{ color: '#d8b4fe', flexShrink: 0 }} />
                              <div>
                                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.88rem' }}>{med.name}</div>
                                <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem' }}>{med.dosage} · {med.frequency} · {med.duration}</div>
                                {med.instructions && <div style={{ color: 'rgba(148,163,184,0.4)', fontSize: '0.72rem', fontStyle: 'italic' }}>{med.instructions}</div>}
                              </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); toggleReminder(rx._id, med.name); }}
                              title={hasReminder ? 'Reminder active — click to disable' : 'Set reminder'}
                              style={{ background: hasReminder ? 'rgba(249,168,212,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${hasReminder ? 'rgba(249,168,212,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: hasReminder ? '#f9a8d4' : 'rgba(148,163,184,0.4)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem' }}>
                              {hasReminder ? <><Bell size={13} /> On</> : <><BellOff size={13} /> Remind</>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Instructions */}
                    {rx.instructions && (
                      <div style={{ marginTop: '1rem', padding: '10px 14px', background: 'rgba(216,180,254,0.05)', border: '1px solid rgba(216,180,254,0.15)', borderRadius: 12 }}>
                        <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Instructions</div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.6 }}>{rx.instructions}</div>
                      </div>
                    )}
                    {/* Follow-up & Dispensed */}
                    <div style={{ display: 'flex', gap: 12, marginTop: '1rem', flexWrap: 'wrap' }}>
                      {rx.followUpDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(249,168,212,0.06)', border: '1px solid rgba(249,168,212,0.15)', borderRadius: 10, fontSize: '0.78rem', color: '#f9a8d4' }}>
                          <Calendar size={13} /> Follow-up: {rx.followUpDate}
                        </div>
                      )}
                      {rx.status === 'dispensed' && rx.dispensedAt && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(251,207,232,0.06)', border: '1px solid rgba(251,207,232,0.15)', borderRadius: 10, fontSize: '0.78rem', color: '#fbcfe8' }}>
                          <CheckCircle size={13} /> Dispensed: {new Date(rx.dispensedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PrescriptionView;

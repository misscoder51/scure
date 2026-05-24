import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Video, Clock, User, CheckCircle, PlusCircle, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [rxForm, setRxForm]             = useState({ patientId: '', patientName: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }], instructions: '', followUpDate: '' });
  const [rxStatus, setRxStatus]         = useState('');
  const [rxLoading, setRxLoading]       = useState(false);
  const [selectedApt, setSelectedApt]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const query = user ? `?doctorId=${user._id}` : '';
        const res = await axios.get(`https://scure-backend.onrender.com/appointments${query}`);
        setAppointments(res.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetchAppointments();
  }, [user]);

  const handleStatusUpdate = async (aptId, newStatus) => {
    try {
      await axios.patch(`https://scure-backend.onrender.com/appointments/${aptId}`, { status: newStatus });
      setAppointments(prev => prev.map(a => a._id === aptId ? { ...a, status: newStatus } : a));
    } catch (e) { console.error(e); }
  };

  const handleCreateRx = async (e) => {
    e.preventDefault();
    if (!rxForm.patientName || rxForm.medicines[0].name === '') { setRxStatus('Please fill patient name and at least one medicine.'); return; }
    setRxLoading(true); setRxStatus('');
    try {
      await axios.post('https://scure-backend.onrender.com/prescriptions', {
        ...rxForm,
        doctorId: user?._id,
        doctorName: `Dr. ${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        appointmentId: selectedApt,
        createdAt: new Date().toISOString()
      });
      setRxStatus('✓ Prescription created and sent to dispensary.');
      setRxForm({ patientId: '', patientName: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }], instructions: '', followUpDate: '' });
      setSelectedApt(null);
    } catch (err) {
      setRxStatus('Error creating prescription. Please try again.');
    } finally { setRxLoading(false); }
  };

  const addMedicine = () => setRxForm(f => ({ ...f, medicines: [...f.medicines, { name: '', dosage: '', frequency: '', duration: '' }] }));
  const updateMed = (i, field, val) => setRxForm(f => ({ ...f, medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }));
  const removeMed = (i) => setRxForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));


  const cardStyle = {
    background: 'rgba(6,9,20,0.7)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem',
  };

  const fieldStyle = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
    padding: '11px 16px', fontSize: '0.9rem', color: '#e2e8f0',
    outline: 'none', fontFamily: 'inherit', transition: 'all 0.25s',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem clamp(1rem, 3vw, 2rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome Banner */}
      <div style={{
        ...cardStyle, padding: '2rem',
        background: 'linear-gradient(135deg, rgba(251,207,232,0.07), rgba(249,168,212,0.05))',
        border: '1px solid rgba(251,207,232,0.15)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,207,232,0.12), transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <div className="neon-badge neon-badge-emerald" style={{ marginBottom: '0.75rem' }}>Physician Console</div>
          <h2 style={{ color: '#f8fafc', fontWeight: 900, fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            Good morning, {user?.username || `Dr. ${user?.firstName}`}
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.7)', margin: 0, fontSize: '0.9rem' }}>
            Your active patient queue, telehealth links, and digital dispensary authorization are ready.
          </p>
        </div>
      </div>

      {/* Stat Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Queue Today', value: appointments.length || '—', icon: <User size={16} />, color: '#f9a8d4' },
          { label: 'Avg. Consult', value: '12 min', icon: <Clock size={16} />, color: '#d8b4fe' },
          { label: 'Prescriptions Sent', value: '7', icon: <CheckCircle size={16} />, color: '#fbcfe8' },
        ].map((s) => (
          <div key={s.label} style={{ ...cardStyle, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `rgba(${s.color === '#f9a8d4' ? '249,168,212' : s.color === '#d8b4fe' ? '216,180,254' : '251,207,232'},0.12)`, border: `1px solid rgba(${s.color === '#f9a8d4' ? '249,168,212' : s.color === '#d8b4fe' ? '216,180,254' : '251,207,232'},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: '1.4rem', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.78rem', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>

        {/* Patient Queue */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', margin: '0 0 4px' }}>Active Patient Queue</h3>
              <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem', margin: 0 }}>Scheduled consultation requests for today</p>
            </div>
            <button onClick={() => navigate('/appointment-list')} className="btn-cyber-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
              View All
            </button>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(251,207,232,0.2)', borderTopColor: '#fbcfe8', animation: 'rotate-slow 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(251,207,232,0.08)', border: '1px solid rgba(251,207,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={28} color="#fbcfe8" />
              </div>
              <div>
                <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>All caught up! 🎉</div>
                <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.85rem' }}>No active patient appointments in the queue.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {appointments.map((apt) => {
                const statusColor = { pending: '#f59e0b', confirmed: '#f9a8d4', completed: '#fbcfe8', cancelled: '#f9a8d4' }[apt.status] || '#94a3b8';
                return (
                  <div key={apt._id} style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(251,207,232,0.1)', border: '1px solid rgba(251,207,232,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Activity size={15} style={{ color: '#fbcfe8' }} />
                        </div>
                        <div>
                          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem' }}>{apt.studentName}</div>
                          <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.73rem' }}>{apt.selectedDate} · {apt.selectedTime}</div>
                        </div>
                      </div>
                      <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', background: `${statusColor}18`, border: `1px solid ${statusColor}40`, color: statusColor }}>{apt.status}</span>
                    </div>
                    {apt.reason && <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem', marginBottom: 8, fontStyle: 'italic' }}>Reason: {apt.reason}</div>}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {apt.status === 'pending' && <button onClick={() => handleStatusUpdate(apt._id, 'confirmed')} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(249,168,212,0.1)', border: '1px solid rgba(249,168,212,0.25)', color: '#f9a8d4', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>✓ Confirm</button>}
                      {apt.status === 'confirmed' && <button onClick={() => handleStatusUpdate(apt._id, 'completed')} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(251,207,232,0.1)', border: '1px solid rgba(251,207,232,0.25)', color: '#fbcfe8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>✓ Complete</button>}
                      {apt.status !== 'cancelled' && apt.status !== 'completed' && <button onClick={() => handleStatusUpdate(apt._id, 'cancelled')} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(249,168,212,0.08)', border: '1px solid rgba(249,168,212,0.2)', color: '#f9a8d4', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>}
                      {apt.type === 'video' && apt.roomId && <button onClick={() => navigate(`/video-call/${apt.roomId}`)} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(216,180,254,0.1)', border: '1px solid rgba(216,180,254,0.25)', color: '#d8b4fe', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Video size={11} /> Video Call
                      </button>}
                      <button onClick={() => { setRxForm(f => ({ ...f, patientId: apt.studentId || '', patientName: apt.studentName || '' })); setSelectedApt(apt._id); }} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(216,180,254,0.08)', border: '1px solid rgba(216,180,254,0.2)', color: '#d8b4fe', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Prescribe</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Telehealth */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(251,207,232,0.06), rgba(249,168,212,0.05))', border: '1px solid rgba(251,207,232,0.15)' }}>
            <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1rem', margin: '0 0 8px' }}>Start Telehealth Session</h3>
            <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.82rem', margin: '0 0 1.25rem' }}>Launch an encrypted video consultation with a waiting patient</p>
            <button onClick={() => navigate('/video-call/instant-queue')} className="btn-cyber-primary" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #fbcfe8, #f9a8d4)' }}>
              <Video size={15} /> Start Video Call
            </button>
          </div>

          {/* Digital Rx */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <PlusCircle size={16} style={{ color: '#d8b4fe' }} />
              <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1rem', margin: 0 }}>Issue Prescription</h3>
              {selectedApt && <span style={{ marginLeft: 4, padding: '2px 8px', borderRadius: 999, background: 'rgba(249,168,212,0.1)', border: '1px solid rgba(249,168,212,0.2)', color: '#f9a8d4', fontSize: '0.68rem', fontWeight: 800 }}>Linked to appointment</span>}
            </div>
            <form onSubmit={handleCreateRx} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input placeholder="Patient Name *" value={rxForm.patientName} onChange={e => setRxForm(f => ({ ...f, patientName: e.target.value }))}
                style={fieldStyle} onFocus={e => e.target.style.borderColor = 'rgba(216,180,254,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Medicines</div>
              {rxForm.medicines.map((med, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 6 }}>
                  <input placeholder="Medicine name" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} style={{ ...fieldStyle, fontSize: '0.8rem' }} />
                  <input placeholder="Dose" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} style={{ ...fieldStyle, fontSize: '0.8rem' }} />
                  <input placeholder="Freq." value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} style={{ ...fieldStyle, fontSize: '0.8rem' }} />
                  <input placeholder="Days" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} style={{ ...fieldStyle, fontSize: '0.8rem' }} />
                  {i > 0 && <button type="button" onClick={() => removeMed(i)} style={{ background: 'rgba(249,168,212,0.08)', border: '1px solid rgba(249,168,212,0.2)', borderRadius: 8, color: '#f9a8d4', cursor: 'pointer', padding: '0 8px', fontSize: '1rem' }}>×</button>}
                </div>
              ))}
              <button type="button" onClick={addMedicine} style={{ padding: '8px', borderRadius: 10, background: 'rgba(216,180,254,0.06)', border: '1px dashed rgba(216,180,254,0.2)', color: '#d8b4fe', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>+ Add Medicine</button>
              <input placeholder="Instructions (optional)" value={rxForm.instructions} onChange={e => setRxForm(f => ({ ...f, instructions: e.target.value }))} style={fieldStyle} />
              <input type="date" placeholder="Follow-up date" value={rxForm.followUpDate} onChange={e => setRxForm(f => ({ ...f, followUpDate: e.target.value }))} style={{ ...fieldStyle, colorScheme: 'dark' }} />
              {rxStatus && (
                <div style={{ padding: '8px 12px', borderRadius: 10, background: rxStatus.includes('✓') ? 'rgba(251,207,232,0.08)' : 'rgba(249,168,212,0.08)', border: `1px solid rgba(${rxStatus.includes('✓') ? '251,207,232' : '249,168,212'},0.2)`, color: rxStatus.includes('✓') ? '#6ee7b7' : '#fca5a5', fontSize: '0.8rem' }}>
                  {rxStatus}
                </div>
              )}
              <button type="submit" disabled={rxLoading} className="btn-cyber-primary" style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #d8b4fe, #7c3aed)', opacity: rxLoading ? 0.7 : 1 }}>
                <Zap size={14} /> {rxLoading ? 'Creating...' : 'Issue Prescription'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

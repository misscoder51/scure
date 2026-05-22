import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, Calendar, Heart, ArrowRight, Pill, FileText, Video, Brain } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PaymentModal from '../Payment/PaymentModal';


const CheckCircle = ({ size = 16, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    Promise.all([
      axios.get(`http://localhost:5001/appointments?studentId=${user._id}`).catch(() => ({ data: [] })),
      axios.get(`http://localhost:5001/prescriptions?patientId=${user._id}`).catch(() => ({ data: [] })),
      axios.get(`http://localhost:5001/health-records?studentId=${user._id}`).catch(() => ({ data: [] })),
    ]).then(([aptRes, rxRes, hrRes]) => {
      setAppointments(aptRes.data);
      setPrescriptions(rxRes.data);
      setHealthRecords(hrRes.data);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [user]);


  const cardStyle = {
    background: 'rgba(6,9,20,0.7)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20,
    padding: '1.5rem', transition: 'all 0.3s ease',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem clamp(1rem, 3vw, 2rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome Banner */}
      <div style={{
        ...cardStyle,
        background: 'linear-gradient(135deg, rgba(249,168,212,0.08), rgba(216,180,254,0.06))',
        border: '1px solid rgba(249,168,212,0.15)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,168,212,0.12), transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div className="neon-badge neon-badge-cyan" style={{ marginBottom: '0.75rem' }}>Student Patient Console</div>
            <h2 style={{ color: '#f8fafc', fontWeight: 900, fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
              Welcome, {user?.firstName || 'Student'} {user?.lastName || ''}
            </h2>
            <p style={{ color: 'rgba(148,163,184,0.7)', margin: 0, maxWidth: 560, fontSize: '0.9rem' }}>
              Access AI-powered consultations, track dispensary prescriptions, and manage scheduled clinic visits.
            </p>
            {user?.studentId && <div style={{ marginTop: 8, color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem' }}>Student ID: <span style={{ color: '#f9a8d4', fontWeight: 700 }}>{user.studentId}</span></div>}
          </div>
          <button onClick={() => navigate('/symptom-checker')} className="btn-cyber-primary" style={{ flexShrink: 0, padding: '10px 20px', fontSize: '0.88rem' }}>
            <Brain size={16} /> AI Symptom Check
          </button>
        </div>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Appointments */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', margin: '0 0 4px' }}>Scheduled Visits</h3>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem', margin: 0 }}>Upcoming consultations with campus physicians</p>
              </div>
              <Link to="/appointment-scheduler" className="btn-cyber-secondary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.82rem' }}>
                Book Slot <ArrowRight size={14} />
              </Link>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#f9a8d4' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(249,168,212,0.2)', borderTopColor: '#f9a8d4', animation: 'rotate-slow 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 16 }}>
                <Calendar size={32} style={{ color: 'rgba(148,163,184,0.2)', marginBottom: 8 }} />
                <p style={{ color: 'rgba(148,163,184,0.4)', fontSize: '0.85rem', margin: 0 }}>No upcoming appointments</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {appointments.slice(0, 3).map((apt) => (
                  <div key={apt._id || apt.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'border-color 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(249,168,212,0.12)', border: '1px solid rgba(249,168,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={16} style={{ color: '#f9a8d4' }} />
                      </div>
                      <div>
                        <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem' }}>Dr. {apt.selectedDoctor}</div>
                        <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem', display: 'flex', gap: 8 }}>
                          <span>{apt.selectedDate}</span>
                          <span>·</span>
                          <span>{apt.selectedTime}</span>
                        </div>
                      </div>
                    </div>
                    <Link to="/appointment-list" style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.7)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions */}
          <div style={cardStyle}>
            <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', margin: '0 0 4px' }}>Active Prescriptions</h3>
            <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem', margin: '0 0 1.25rem' }}>Cleared by university pharmacy inventory</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'Paracetamol 500mg', note: 'Twice daily after meals · 5 days remaining', status: 'Ready', color: '#fbcfe8' },
                { name: 'Amoxicillin 250mg', note: '3× daily · 3 days remaining', status: 'Pending', color: '#f59e0b' },
              ].map((rx) => (
                <div key={rx.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: `rgba(${rx.color === '#fbcfe8' ? '251,207,232' : '245,158,11'},0.12)`, border: `1px solid rgba(${rx.color === '#fbcfe8' ? '251,207,232' : '245,158,11'},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pill size={16} style={{ color: rx.color }} />
                    </div>
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem' }}>{rx.name}</div>
                      <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem' }}>{rx.note}</div>
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 999, background: `rgba(${rx.color === '#fbcfe8' ? '251,207,232' : '245,158,11'},0.1)`, border: `1px solid rgba(${rx.color === '#fbcfe8' ? '251,207,232' : '245,158,11'},0.25)`, color: rx.color, fontSize: '0.72rem', fontWeight: 800 }}>
                    {rx.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Instant Telehealth */}
          <div style={cardStyle}>
            <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', margin: '0 0 8px' }}>Instant Telehealth</h3>
            <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.82rem', margin: '0 0 1.25rem' }}>Connect with an on-duty doctor via secure video — immediately</p>
            <button onClick={() => setIsPaymentModalOpen(true)} className="btn-cyber-primary" style={{ width: '100%', padding: '13px' }}>
              <Video size={16} /> Launch Consultation
            </button>
          </div>

          {/* Recent Prescriptions */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', margin: '0 0 4px' }}>Active Prescriptions</h3>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem', margin: 0 }}>Medications from campus doctors</p>
              </div>
              <button onClick={() => navigate('/prescriptions')} className="btn-cyber-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                View All
              </button>
            </div>
            
            {prescriptions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.06)' }}>
                <Pill size={24} style={{ color: 'rgba(148,163,184,0.3)', marginBottom: 8 }} />
                <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem' }}>No active prescriptions</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {prescriptions.slice(0, 3).map((rx) => (
                  <div key={rx._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: 'rgba(216,180,254,0.05)', border: '1px solid rgba(216,180,254,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Pill size={16} style={{ color: '#d8b4fe' }} />
                      <div>
                        <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.85rem' }}>{rx.medicines?.[0]?.name || 'Medication'} {rx.medicines?.length > 1 && `+${rx.medicines.length - 1} more`}</div>
                        <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem' }}>{rx.doctorName}</div>
                      </div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: rx.status === 'dispensed' ? 'rgba(251,207,232,0.1)' : 'rgba(249,168,212,0.1)', color: rx.status === 'dispensed' ? '#fbcfe8' : '#f9a8d4', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      {rx.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Health Records Summary */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', margin: '0 0 4px' }}>Recent Health Records</h3>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem', margin: 0 }}>Your medical history</p>
              </div>
              <button onClick={() => navigate('/health-records')} className="btn-cyber-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                View All
              </button>
            </div>

            {healthRecords.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.06)' }}>
                <FileText size={24} style={{ color: 'rgba(148,163,184,0.3)', marginBottom: 8 }} />
                <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem' }}>No health records available</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {healthRecords.slice(0, 2).map((hr) => (
                  <div key={hr._id} style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(249,168,212,0.05)', border: '1px solid rgba(249,168,212,0.15)' }}>
                    <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>{hr.diagnosis}</div>
                    <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem' }}>{hr.doctorName} · {new Date(hr.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        amount={50} 
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          navigate('/video-call/instant-queue');
        }} 
      />
    </div>
  );
};

export default StudentDashboard;

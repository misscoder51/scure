import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle, CheckCircle, AlertTriangle, User, Award, Mail, Zap } from 'lucide-react';

const fieldStyle = {
  width: '100%', background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
  padding: '13px 18px 13px 44px', fontSize: '0.9rem',
  color: '#e2e8f0', outline: 'none', fontFamily: 'inherit',
  transition: 'all 0.25s ease',
};

const labelStyle = {
  display: 'block', color: 'rgba(148,163,184,0.6)',
  fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: 8,
};

const onFocus = (e) => { e.target.style.borderColor = 'rgba(216,180,254,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(216,180,254,0.1)'; };
const onBlur  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; };

const AddDoctorForm = () => {
  const [name, setName]               = useState('');
  const [specialization, setSpec]     = useState('');
  const [email, setEmail]             = useState('');
  const [message, setMessage]         = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [isSuccess, setIsSuccess]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !specialization || !email) { setMessage('Please fill in all fields.'); setIsSuccess(false); return; }
    setIsLoading(true); setMessage('');
    try {
      const r = await axios.post('https://scure-backend.onrender.com/doctors', { name, specialization, email });
      setIsSuccess(true);
      setMessage(`Dr. ${name} registered with ID: ${r.data._id || r.data.id}`);
      setName(''); setSpec(''); setEmail('');
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.response?.data?.message || `Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'rgba(6,9,20,0.85)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(216,180,254,0.2)', borderRadius: 24,
        padding: '2.5rem',
        boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(216,180,254,0.06)',
        animation: 'fade-up 0.5s ease both',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg, #d8b4fe, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 30px rgba(216,180,254,0.4)',
          }}>
            <PlusCircle size={26} color="#fff" />
          </div>
          <h2 style={{ color: '#f8fafc', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            Register Physician
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.9rem', margin: 0 }}>
            Add a new campus doctor to the S-Cure network
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Name */}
          <div>
            <label htmlFor="doc-name" style={labelStyle}>Doctor Name</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
              <input id="doc-name" type="text" placeholder="Full name (e.g. Dr. Aman Singh)"
                value={name} onChange={(e) => setName(e.target.value)}
                style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Specialization */}
          <div>
            <label htmlFor="doc-spec" style={labelStyle}>Specialization</label>
            <div style={{ position: 'relative' }}>
              <Award size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
              <input id="doc-spec" type="text" placeholder="e.g. General Practitioner, Cardiologist"
                value={specialization} onChange={(e) => setSpec(e.target.value)}
                style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="doc-email" style={labelStyle}>Contact Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
              <input id="doc-email" type="email" placeholder="doctor@university.edu"
                value={email} onChange={(e) => setEmail(e.target.value)}
                style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Alert Message */}
          {message && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 12, fontSize: '0.85rem',
              background: isSuccess ? 'rgba(251,207,232,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${isSuccess ? 'rgba(251,207,232,0.25)' : 'rgba(239,68,68,0.25)'}`,
              color: isSuccess ? '#6ee7b7' : '#fca5a5',
            }}>
              {isSuccess ? <CheckCircle size={15} style={{ flexShrink: 0 }} /> : <AlertTriangle size={15} style={{ flexShrink: 0 }} />}
              {message}
            </div>
          )}

          <button type="submit" disabled={isLoading}
            className="btn-cyber-primary"
            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', opacity: isLoading ? 0.7 : 1,
              background: 'linear-gradient(135deg, #d8b4fe, #7c3aed)',
            }}>
            {isLoading ? (
              <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'rotate-slow 0.8s linear infinite' }} />Adding Doctor...</>
            ) : (
              <><Zap size={16} /> Register Doctor</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorForm;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, KeyRound, User, ArrowRight, CheckCircle } from 'lucide-react';

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

const Register = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', password: '', confirmPassword: '', role: 'student', studentId: '', department: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const onChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.username || !form.password) { setError('Please fill all required fields.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true); setError('');
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, username: form.username, password: form.password, role: form.role, studentId: form.studentId, department: form.department });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'rgba(6,9,20,0.85)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(249,168,212,0.15)', borderRadius: 24,
        padding: '2.5rem',
        boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(249,168,212,0.06)',
        animation: 'fade-up 0.5s ease both',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #d8b4fe, #f9a8d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 30px rgba(216,180,254,0.4)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ color: '#f8fafc', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Create Account</h2>
          <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.9rem', margin: 0 }}>Join S-Cure Campus Health Network</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[['firstName','First Name','Your first name'], ['lastName','Last Name','Your last name']].map(([key, label, ph]) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
                  <input type="text" placeholder={ph} value={form[key]} onChange={onChange(key)} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            ))}
          </div>

          {/* Username */}
          <div>
            <label style={labelStyle}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
              <input type="text" placeholder="Choose a unique username" value={form.username} onChange={onChange('username')} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Role */}
          <div>
            <label style={labelStyle}>Role</label>
            <select value={form.role} onChange={onChange('role')} style={{ ...plainFieldStyle, appearance: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.04)' }} onFocus={onFocus} onBlur={onBlur}>
              <option value="student" style={{ color: '#000' }}>Student</option>
              <option value="doctor" style={{ color: '#000' }}>Doctor</option>
              <option value="pharmacist" style={{ color: '#000' }}>Pharmacist</option>
              <option value="admin" style={{ color: '#000' }}>Administrator</option>
            </select>
          </div>

          {/* Conditional: Student ID */}
          {form.role === 'student' && (
            <div>
              <label style={labelStyle}>Student ID</label>
              <input type="text" placeholder="e.g. 2026CSE001" value={form.studentId} onChange={onChange('studentId')} style={plainFieldStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          )}

          {/* Department */}
          {(form.role === 'student' || form.role === 'doctor') && (
            <div>
              <label style={labelStyle}>Department / Specialization</label>
              <input type="text" placeholder="e.g. Computer Science / General Medicine" value={form.department} onChange={onChange('department')} style={plainFieldStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          )}

          {/* Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[['password','Password','••••••••'],['confirmPassword','Confirm Password','••••••••']].map(([key, label, ph]) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
                  <input type="password" placeholder={ph} value={form[key]} onChange={onChange(key)} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            ))}
          </div>

          {/* Messages */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, color: '#fca5a5', fontSize: '0.85rem' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />{error}
            </div>
          )}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(251,207,232,0.08)', border: '1px solid rgba(251,207,232,0.25)', borderRadius: 12, color: '#6ee7b7', fontSize: '0.85rem' }}>
              <CheckCircle size={15} style={{ flexShrink: 0 }} />{success}
            </div>
          )}

          <button type="submit" className="btn-cyber-primary" disabled={isLoading}
            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: 4, opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? (
              <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'rotate-slow 0.8s linear infinite' }} />Creating Account...</>
            ) : (
              <><ArrowRight size={16} /> Create Account</>
            )}
          </button>

          <p style={{ textAlign: 'center', color: 'rgba(148,163,184,0.5)', fontSize: '0.85rem', margin: 0 }}>
            Already have an account?{' '}<Link to="/login" style={{ color: '#f9a8d4', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, KeyRound, User, ArrowRight } from 'lucide-react';

const fieldStyle = {
  width: '100%', background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
  padding: '13px 18px 13px 44px', fontSize: '0.95rem',
  color: '#e2e8f0', outline: 'none', fontFamily: 'inherit',
  transition: 'all 0.25s ease',
};

const labelStyle = {
  display: 'block', color: 'rgba(148,163,184,0.6)',
  fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: 8,
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please fill in all fields.'); return; }
    setIsLoading(true); setError('');
    try {
      const data = await login(username, password);
      const role = data.role;
      if (role === 'admin')       navigate('/admin-dashboard');
      else if (role === 'doctor') navigate('/doctor-dashboard');
      else if (role === 'pharmacist') navigate('/pharmacist-dashboard');
      else navigate('/student-dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{
        width: '100%', maxWidth: 440,
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
            background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 30px rgba(249,168,212,0.4)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ color: '#f8fafc', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            Welcome back
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.9rem', margin: 0 }}>
            Sign in to S-Cure Campus Intelligence
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Username */}
          <div>
            <label htmlFor="login-username" style={labelStyle}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
              <input id="login-username" type="text" placeholder="Enter your username"
                value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading}
                style={fieldStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(249,168,212,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,168,212,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
              <input id="login-password" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
                style={fieldStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(249,168,212,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,168,212,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 12, color: '#fca5a5', fontSize: '0.85rem',
            }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button type="submit" className="btn-cyber-primary" disabled={isLoading}
            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: 4, opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'rotate-slow 0.8s linear infinite' }} />
                Authenticating...
              </>
            ) : (
              <><ArrowRight size={16} /> Sign In</>
            )}
          </button>

          <p style={{ textAlign: 'center', color: 'rgba(148,163,184,0.5)', fontSize: '0.85rem', margin: 0 }}>
            New to S-Cure?{' '}
            <Link to="/register" style={{ color: '#f9a8d4', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

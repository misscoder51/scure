import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Footer = () => (
  <footer style={{
    borderTop: '1px solid rgba(255,255,255,0.05)',
    padding: '3rem clamp(1.5rem, 5vw, 4rem)',
    marginTop: 'auto',
  }}>
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>

      {/* Brand */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{
            fontWeight: 800, fontSize: '1rem',
            background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>S-Cure</span>
        </div>
        <p style={{ color: 'rgba(100,116,139,0.8)', fontSize: '0.8rem', maxWidth: 260, margin: 0 }}>
          AI-powered campus healthcare — smarter dispensaries, faster care, zero lines.
        </p>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Platform', links: [{ to: '/', text: 'Home' }, { to: '/appointment-scheduler', text: 'Book Appointment' }, { to: '/appointment-list', text: 'View Appointments' }] },
          { label: 'Access', links: [{ to: '/login', text: 'Login' }, { to: '/register', text: 'Register' }, { to: '/add-doctor', text: 'Add Doctor' }] },
        ].map((col) => (
          <div key={col.label}>
            <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {col.label}
            </div>
            {col.links.map((l) => (
              <div key={l.to} style={{ marginBottom: 8 }}>
                <Link to={l.to} style={{
                  color: 'rgba(148,163,184,0.7)', fontSize: '0.85rem', textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f9a8d4')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(148,163,184,0.7)')}
                >
                  {l.text}
                </Link>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Status + Social */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(251,207,232,0.08)', border: '1px solid rgba(251,207,232,0.2)' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fbcfe8', animation: 'glow-pulse 2s infinite' }} />
          <span style={{ color: '#fbcfe8', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em' }}>ALL SYSTEMS OPERATIONAL</span>
        </div>
        <div style={{ color: 'rgba(71,85,105,0.7)', fontSize: '0.75rem' }}>
          © 2025 S-Cure · Campus Health Intelligence
        </div>
      </div>

    </div>
  </footer>
);

export default Footer;

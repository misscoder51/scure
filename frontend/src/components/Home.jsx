import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Video, ShieldCheck, Heart, Activity, Users, Clock, Zap, Brain } from 'lucide-react';
import AIOrb from './AIOrb';
import TiltCard from './TiltCard';

/* ---- Animated Counter ---- */
const Counter = ({ end, suffix = '', prefix = '' }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0;
      const step = end / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= end) { setVal(end); clearInterval(timer); }
        else setVal(Math.floor(start));
      }, 20);
      observer.disconnect();
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
};

const Home = () => {
  const [scrollY, setScrollY] = useState(0); // eslint-disable-line no-unused-vars
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '0 clamp(1.5rem, 5vw, 4rem)',
        maxWidth: 1280, margin: '0 auto',
        position: 'relative',
      }}>
        {/* Left Column */}
        <div style={{ flex: 1, maxWidth: 620, paddingRight: '2rem', zIndex: 2 }}>

          {/* Badge */}
          <div className="neon-badge neon-badge-cyan" style={{ marginBottom: '1.5rem', animation: 'fade-up 0.6s ease both' }}>
            <div className="pulse-dot" style={{ width: 6, height: 6 }} />
            AI Campus Health System — Online
          </div>

          {/* Headline */}
          <h1 style={{
            fontWeight: 900,
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: '#f8fafc',
            margin: '0 0 1.2rem',
            animation: 'fade-up 0.7s 0.1s ease both',
          }}>
            We broke the{' '}
            <span className="text-gradient-cyber">waiting room.</span>
            <br />Welcome to campus health.
          </h1>

          {/* Subhead */}
          <p style={{
            color: 'rgba(148,163,184,0.85)',
            fontSize: '1.1rem', lineHeight: 1.7,
            maxWidth: 520, marginBottom: '2.2rem',
            animation: 'fade-up 0.8s 0.2s ease both',
          }}>
            Talk to a doctor before the line even forms. Instant AI triage, encrypted telehealth, and intelligent dispensary automation — built specifically for modern universities.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fade-up 0.9s 0.3s ease both' }}>
            <Link to="/login" className="btn-cyber-primary" style={{ textDecoration: 'none', fontSize: '0.95rem' }}>
              <Zap size={16} />
              Enter the Portal
              <ArrowRight size={16} />
            </Link>
            <Link to="/appointment-scheduler" className="btn-cyber-secondary" style={{ textDecoration: 'none', fontSize: '0.95rem' }}>
              Book Appointment
            </Link>
          </div>

          {/* Social proof chips */}
          <div style={{ display: 'flex', gap: 16, marginTop: '2.5rem', flexWrap: 'wrap', animation: 'fade-up 1s 0.4s ease both' }}>
            {[
              { icon: <Users size={14} />, label: '4,200+ Students Served' },
              { icon: <Heart size={14} />, label: '99.8% Uptime' },
              { icon: <Clock size={14} />, label: '< 5 min Wait' },
            ].map((chip) => (
              <div key={chip.label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(148,163,184,0.8)',
                fontSize: '0.78rem', fontWeight: 600,
              }}>
                <span style={{ color: '#f9a8d4' }}>{chip.icon}</span>
                {chip.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column — AI Orb + ECG */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '1.5rem', zIndex: 2,
          animation: 'fade-up 1s 0.2s ease both',
        }}>
          {/* AI Orb */}
          <div className="animate-float-orb">
            <AIOrb size={300} />
          </div>

          {/* ECG Card below orb */}
          <div style={{
            background: 'rgba(249,168,212,0.05)',
            border: '1px solid rgba(249,168,212,0.2)',
            borderRadius: 16, padding: '14px 20px',
            backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 380,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live ECG Signal</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="pulse-dot" style={{ width: 6, height: 6, background: '#fbcfe8' }} />
                <span style={{ color: '#fbcfe8', fontSize: '0.72rem', fontWeight: 700 }}>72 bpm</span>
              </div>
            </div>
            <svg viewBox="0 0 320 60" style={{ width: '100%', overflow: 'visible' }}>
              <path
                d="M 0,30 L 40,30 L 55,8 L 65,52 L 75,25 L 80,35 L 85,30 L 140,30 L 155,5 L 165,55 L 175,22 L 180,38 L 185,30 L 240,30 L 255,8 L 265,52 L 275,25 L 280,35 L 285,30 L 320,30"
                fill="none" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round"
                className="ecg-line"
                style={{ filter: 'drop-shadow(0 0 4px rgba(249,168,212,0.8))' }}
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ============================================================
          ANIMATED DIVIDER
          ============================================================ */}
      <div className="glow-divider" style={{ maxWidth: 1280, margin: '0 auto', opacity: 0.6 }} />

      {/* ============================================================
          LIVE METRICS
          ============================================================ */}
      <section style={{ padding: '4rem clamp(1.5rem, 5vw, 4rem)', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Students Served', end: 4200, suffix: '+', color: '#f9a8d4', icon: <Users size={20} />, delay: 0 },
            { label: 'Avg Response Time', end: 5, suffix: ' min', color: '#fbcfe8', icon: <Clock size={20} />, delay: 0.15 },
            { label: 'Diagnosis Accuracy', end: 98, suffix: '%', color: '#d8b4fe', icon: <Brain size={20} />, delay: 0.05 },
            { label: 'Doctors On-Platform', end: 24, suffix: '', color: '#3b82f6', icon: <Activity size={20} />, delay: 0.2 },
          ].map((stat, i) => (
            <div key={stat.label} style={{ animation: `fade-up 0.8s ${stat.delay}s ease both`, transform: i % 2 === 0 ? 'translateY(6px)' : 'translateY(-6px)' }}>
              <TiltCard className="" style={{ padding: i === 1 ? '1.8rem 1.2rem' : '1.5rem' }}>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ color: stat.color, marginBottom: 12 }}>{stat.icon}</div>
                  <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
                    <Counter end={stat.end} suffix={stat.suffix} />
                  </div>
                  <div style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.82rem', marginTop: 6, fontWeight: 600 }}>
                    {stat.label}
                  </div>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      </section>

      <div className="glow-divider" style={{ maxWidth: 1280, margin: '0 auto', opacity: 0.4 }} />

      {/* ============================================================
          BENTO FEATURE GRID
          ============================================================ */}
      <section style={{ padding: '4rem clamp(1.5rem, 5vw, 4rem)', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="neon-badge neon-badge-purple" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            The Campus Clinic, Uncaged
          </div>
          <h2 style={{
            fontWeight: 900, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
            color: '#f8fafc', margin: '0 0 1rem', letterSpacing: '-0.02em',
          }}>
            Everything you need. <span className="text-gradient-cyber">None of the chaos.</span>
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.7)', maxWidth: 560, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
            A bespoke suite of tools replacing outdated legacy systems with lightning-fast triage and care.
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>

          {/* Card 1 — Wide */}
          <div style={{ gridColumn: 'span 7' }}>
            <TiltCard>
              <div style={{ padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(249,168,212,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div className="icon-glow-cyan" style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
                  <Calendar size={24} />
                </div>
                <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.75rem' }}>
                  Smart Dispensary Scheduler
                </h3>
                <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 480, marginBottom: '1.5rem' }}>
                  Skip the 8 AM rush. Lock in your consultation with campus physicians and pharmacists in under 30 seconds. No waiting rooms required.
                </p>
                <Link to="/appointment-scheduler" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  color: '#f9a8d4', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                  transition: 'gap 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.gap = '12px')}
                onMouseLeave={(e) => (e.currentTarget.style.gap = '8px')}
                >
                  Launch Scheduler <ArrowRight size={16} />
                </Link>

                {/* Decorative mini ECG inside card */}
                <svg viewBox="0 0 200 40" style={{ width: '100%', marginTop: '1.5rem', opacity: 0.2 }}>
                  <path d="M0,20 L30,20 L40,5 L50,35 L60,18 L65,22 L70,20 L120,20 L130,5 L140,35 L150,15 L155,25 L160,20 L200,20"
                    fill="none" stroke="#f9a8d4" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </TiltCard>
          </div>

          {/* Card 2 — Tall with offset */}
          <div style={{ gridColumn: 'span 5', marginTop: '2.5rem' }}>
            <TiltCard style={{ height: '100%' }}>
              <div style={{ padding: '2rem 1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'radial-gradient(circle at 80% 20%, rgba(251,207,232,0.05), transparent 60%)' }}>
                <div>
                  <div className="icon-glow-emerald" style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
                    <Video size={24} />
                  </div>
                  <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                    Instant Telehealth
                  </h3>
                  <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                    Secure, encrypted video consultations with on-duty campus doctors from your dorm room.
                  </p>
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ height: 60, borderRadius: 12, background: 'linear-gradient(135deg, rgba(251,207,232,0.15), rgba(249,168,212,0.08))', border: '1px solid rgba(251,207,232,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbcfe8', animation: 'glow-pulse 2s infinite' }} />
                    <span style={{ color: '#fbcfe8', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE NOW</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Card 3 */}
          <div style={{ gridColumn: 'span 4' }}>
            <TiltCard>
              <div style={{ padding: '2rem' }}>
                <div className="icon-glow-purple" style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
                  <ShieldCheck size={24} />
                </div>
                <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                  Encrypted Health Vault
                </h3>
                <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  Military-grade architecture. Your medical records, kept entirely private.
                </p>
                <div className="neon-badge neon-badge-purple" style={{ marginTop: '1.2rem', display: 'inline-block' }}>Military-Grade Encryption</div>
              </div>
            </TiltCard>
          </div>

          {/* Card 4 - Offset */}
          <div style={{ gridColumn: 'span 5', transform: 'translateY(1.5rem)' }}>
            <TiltCard>
              <div style={{ padding: '2.5rem 2rem', background: 'radial-gradient(circle at 10% 90%, rgba(216,180,254,0.05), transparent 50%)' }}>
                <div className="icon-glow-cyan" style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
                  <Brain size={24} />
                </div>
                <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                  AI Triage Engine
                </h3>
                <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  Stop guessing. Our symptom-to-diagnosis intelligence routes you to the exact care you need, instantly.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '98%', background: 'linear-gradient(90deg, #f9a8d4, #d8b4fe)', borderRadius: 999 }} />
                  </div>
                  <span style={{ color: '#f9a8d4', fontWeight: 800, fontSize: '0.82rem' }}>98%</span>
                </div>
                <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem', marginTop: 4 }}>Diagnostic routing accuracy</div>
              </div>
            </TiltCard>
          </div>

          {/* Card 5 */}
          <div style={{ gridColumn: 'span 3' }}>
            <TiltCard>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <div className="icon-glow-emerald" style={{ marginBottom: '1.2rem', width: 'fit-content' }}>
                  <Activity size={20} />
                </div>
                <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                  Pulse Analytics
                </h3>
                <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                  Live tracking for administrators monitoring campus trends and inventory.
                </p>
              </div>
            </TiltCard>
          </div>

        </div>
      </section>

      <div className="glow-divider" style={{ maxWidth: 1280, margin: '0 auto', opacity: 0.4 }} />

      {/* ============================================================
          CTA SECTION
          ============================================================ */}
      <section style={{
        padding: '5rem clamp(1.5rem, 5vw, 4rem)', maxWidth: 1280, margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(249,168,212,0.08), rgba(216,180,254,0.06))',
          border: '1px solid rgba(249,168,212,0.15)',
          borderRadius: 28, padding: 'clamp(2rem, 4vw, 4rem)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(216,180,254,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <h2 style={{
            fontWeight: 900, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: '1rem',
          }}>
            Ready to transform <span className="text-gradient-aurora">campus wellness?</span>
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '1rem', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
            Join thousands of students and faculty already experiencing the future of university healthcare.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-cyber-primary" style={{ textDecoration: 'none' }}>
              <Zap size={16} /> Get Started Free
            </Link>
            <Link to="/appointment-scheduler" className="btn-cyber-secondary" style={{ textDecoration: 'none' }}>
              Book Consultation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

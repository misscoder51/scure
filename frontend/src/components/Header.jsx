import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Bell, User, Zap, Brain, Pill, FileText, LayoutDashboard, X, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const notifCtx = useNotifications();
  const unreadCount   = notifCtx?.unreadCount   ?? 0;
  const notifications = notifCtx?.notifications  ?? [];
  const markRead      = notifCtx?.markRead       ?? (() => {});
  const markAllRead   = notifCtx?.markAllRead    ?? (() => {});

  const [scrolled,       setScrolled]       = useState(false);
  const [notifOpen,      setNotifOpen]      = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin')       return '/admin-dashboard';
    if (user.role === 'doctor')      return '/doctor-dashboard';
    if (user.role === 'pharmacist')  return '/pharmacist-dashboard';
    return '/student-dashboard';
  };

  const navLinkStyle = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 10,
    color: 'rgba(148,163,184,0.85)', fontWeight: 600, fontSize: '0.88rem',
    textDecoration: 'none', border: 'none', background: 'none',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
  };
  const hover = { color: '#f9a8d4', background: 'rgba(249,168,212,0.08)' };
  const unhover = { color: 'rgba(148,163,184,0.85)', background: 'none' };

  const roleColor = { student: '#f9a8d4', doctor: '#fbcfe8', pharmacist: '#d8b4fe', admin: '#f59e0b' };
  const roleBg    = { student: 'rgba(249,168,212,0.15)', doctor: 'rgba(251,207,232,0.15)', pharmacist: 'rgba(216,180,254,0.15)', admin: 'rgba(245,158,11,0.15)' };

  const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const notifTypeIcon = (type) => {
    if (type === 'appointment') return <LayoutDashboard size={14} />;
    if (type === 'prescription') return <Pill size={14} />;
    if (type === 'emergency') return '🚨';
    return <Bell size={14} />;
  };

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: scrolled ? '8px 24px' : '16px 24px', transition: 'all 0.3s ease' }}>
      <nav className="cinematic-nav" style={{ maxWidth: 1280, margin: '0 auto', borderRadius: scrolled ? 16 : 20, padding: '10px 20px', display: 'flex', alignItems: 'center', transition: 'all 0.3s ease' }}>

        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(249,168,212,0.4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            S-Cure
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>

          <Link to="/" style={navLinkStyle} onMouseEnter={e => Object.assign(e.currentTarget.style, hover)} onMouseLeave={e => Object.assign(e.currentTarget.style, unhover)}>Home</Link>

          {!user ? (
            <>
              <Link to="/login" style={navLinkStyle} onMouseEnter={e => Object.assign(e.currentTarget.style, hover)} onMouseLeave={e => Object.assign(e.currentTarget.style, unhover)}>Login</Link>
              <Link to="/register" className="btn-cyber-primary" style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '9px 20px' }}>Get Started</Link>
            </>
          ) : (
            <>
              {/* Role-based quick nav */}
              {user.role === 'student' && (
                <>
                  <button style={navLinkStyle} onClick={() => navigate('/symptom-checker')} onMouseEnter={e => Object.assign(e.currentTarget.style, hover)} onMouseLeave={e => Object.assign(e.currentTarget.style, unhover)}>
                    <Brain size={15} />AI Checker
                  </button>
                  <button style={navLinkStyle} onClick={() => navigate('/prescriptions')} onMouseEnter={e => Object.assign(e.currentTarget.style, hover)} onMouseLeave={e => Object.assign(e.currentTarget.style, unhover)}>
                    <Pill size={15} />Prescriptions
                  </button>
                  <button style={navLinkStyle} onClick={() => navigate('/health-records')} onMouseEnter={e => Object.assign(e.currentTarget.style, hover)} onMouseLeave={e => Object.assign(e.currentTarget.style, unhover)}>
                    <FileText size={15} />Health Records
                  </button>
                </>
              )}

              {/* Dashboard link */}
              <button style={navLinkStyle} onClick={() => navigate(getDashboardPath())} onMouseEnter={e => Object.assign(e.currentTarget.style, hover)} onMouseLeave={e => Object.assign(e.currentTarget.style, unhover)}>
                <LayoutDashboard size={15} />Dashboard
              </button>

              {/* Notification Bell */}
              <div ref={notifRef} style={{ position: 'relative', marginLeft: 4 }}>
                <button onClick={() => setNotifOpen(o => !o)}
                  style={{ ...navLinkStyle, position: 'relative', padding: '8px 10px' }}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, hover)}
                  onMouseLeave={e => Object.assign(e.currentTarget.style, unhover)}>
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, color: '#fff', animation: 'glow-pulse 2s infinite' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 340, background: 'rgba(6,9,20,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(249,168,212,0.06)', overflow: 'hidden', animation: 'fade-up 0.2s ease both', zIndex: 9999 }}>
                    {/* Notif Header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.9rem' }}>Notifications {unreadCount > 0 && <span style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 999, background: 'rgba(249,168,212,0.15)', color: '#f9a8d4', fontSize: '0.7rem' }}>{unreadCount} new</span>}</div>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f9a8d4', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCheck size={13} /> Mark all read
                        </button>
                      )}
                    </div>
                    {/* Notif List */}
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(148,163,184,0.4)', fontSize: '0.85rem' }}>No notifications yet</div>
                      ) : notifications.slice(0, 8).map(n => (
                        <div key={n._id} onClick={() => markRead(n._id)}
                          style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: n.read ? 'transparent' : 'rgba(249,168,212,0.04)', cursor: 'pointer', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(249,168,212,0.04)'}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(249,168,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f9a8d4', flexShrink: 0, fontSize: '0.8rem' }}>
                              {notifTypeIcon(n.type)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: n.read ? '#94a3b8' : '#e2e8f0', fontWeight: n.read ? 600 : 800, fontSize: '0.82rem', marginBottom: 2 }}>{n.title}</div>
                              <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem', lineHeight: 1.5 }}>{n.message}</div>
                              <div style={{ color: 'rgba(148,163,184,0.3)', fontSize: '0.68rem', marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                            </div>
                            {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f9a8d4', flexShrink: 0, marginTop: 4, animation: 'glow-pulse 2s infinite' }} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Chip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'rgba(249,168,212,0.08)', border: '1px solid rgba(249,168,212,0.2)', marginLeft: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} color="#fff" />
                </div>
                <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.82rem' }}>{user.firstName || user.username}</span>
                <span style={{ padding: '2px 8px', borderRadius: 999, background: roleBg[user.role] || 'rgba(216,180,254,0.15)', border: `1px solid ${roleColor[user.role] || '#d8b4fe'}33`, color: roleColor[user.role] || '#d8b4fe', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {user.role || 'student'}
                </span>
              </div>

              <button onClick={handleLogout}
                style={{ ...navLinkStyle, color: 'rgba(252,165,165,0.7)', marginLeft: 4 }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(252,165,165,0.7)'; e.currentTarget.style.background = 'none'; }}>
                <LogOut size={15} />Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

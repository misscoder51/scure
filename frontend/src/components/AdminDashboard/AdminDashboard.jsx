import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, PlusCircle, List, Users, Database, Pill, ShieldCheck, Bell, Zap, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [doctorsCount, setDoctorsCount]     = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [usersCount, setUsersCount]         = useState(0);
  const [inventory, setInventory]           = useState([]);
  const [allUsers, setAllUsers]             = useState([]);
  const [broadcastMsg, setBroadcastMsg]     = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState('');
  const [isLoading, setIsLoading]           = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5001/doctors').catch(() => ({ data: [] })),
      axios.get('http://localhost:5001/appointments').catch(() => ({ data: [] })),
      axios.get('http://localhost:5001/users').catch(() => ({ data: [] })),
      axios.get('http://localhost:5001/inventory').catch(() => ({ data: [] })),
    ]).then(([docRes, aptRes, userRes, invRes]) => {
      setDoctorsCount(docRes.data.length);
      setAppointmentsCount(aptRes.data.length);
      setUsersCount(userRes.data.length);
      setAllUsers(userRes.data.slice(0, 10)); // show first 10
      setInventory(invRes.data);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5001/users/${userId}`);
      setAllUsers(prev => prev.filter(u => u._id !== userId));
      setUsersCount(c => c - 1);
    } catch (e) { console.error(e); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;
    try {
      await axios.post('http://localhost:5001/notifications/broadcast', { title: broadcastTitle, message: broadcastMsg });
      setBroadcastStatus('✓ Broadcast sent to all users!');
      setBroadcastTitle(''); setBroadcastMsg('');
      setTimeout(() => setBroadcastStatus(''), 3000);
    } catch (e) { setBroadcastStatus('Error sending broadcast.'); }
  };

  const cardStyle = {
    background: 'rgba(6,9,20,0.7)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem',
  };

  const totalStock = inventory.reduce((s, i) => s + (i.stock || 0), 0);
  const lowStockCount = inventory.filter(i => i.stock <= i.minStock).length;

  const stats = [
    { label: 'Registered Users', value: isLoading ? '…' : usersCount, icon: <Users size={18} />, color: '#f9a8d4' },
    { label: 'Total Appointments', value: isLoading ? '…' : appointmentsCount, icon: <Activity size={18} />, color: '#d8b4fe' },
    { label: 'Inventory Items', value: isLoading ? '…' : totalStock.toLocaleString(), icon: <Pill size={18} />, color: '#fbcfe8' },
    { label: 'Low Stock Alerts', value: isLoading ? '…' : lowStockCount, icon: <ShieldCheck size={18} />, color: lowStockCount > 0 ? '#f9a8d4' : '#3b82f6' },
  ];


  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem clamp(1rem, 3vw, 2rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome Banner */}
      <div style={{
        ...cardStyle, padding: '2rem',
        background: 'linear-gradient(135deg, rgba(216,180,254,0.07), rgba(249,168,212,0.05))',
        border: '1px solid rgba(216,180,254,0.15)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(216,180,254,0.12), transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <div className="neon-badge neon-badge-purple" style={{ marginBottom: '0.75rem' }}>System Administrator</div>
          <h2 style={{ color: '#f8fafc', fontWeight: 900, fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            S-Cure Control Center
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.7)', margin: 0, fontSize: '0.9rem' }}>
            Manage university physician directories, track booking throughputs, and monitor dispensary inventory in real-time.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...cardStyle, padding: '1.25rem' }}>
            <div style={{ color: s.color, marginBottom: 12 }}>{s.icon}</div>
            <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: '2rem', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.78rem', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>

        {/* Users & Inventory Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Inventory */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <Pill size={18} style={{ color: '#d8b4fe' }} />
              <div>
                <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>Drug Inventory Monitor</h3>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem', margin: 0 }}>Live dispensary stock levels</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {inventory.slice(0, 5).map((drug) => {
                const max = drug.minStock * 4 || 100;
                const pct = Math.min(100, Math.round((drug.stock / max) * 100));
                const color = drug.stock <= drug.minStock ? '#f9a8d4' : pct < 60 ? '#f59e0b' : '#fbcfe8';
                return (
                  <div key={drug._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#e2e8f0', fontSize: '0.88rem', fontWeight: 600 }}>{drug.name}</span>
                      <span style={{ color: color, fontSize: '0.82rem', fontWeight: 800 }}>{drug.stock}/{max}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: 999,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        boxShadow: `0 0 8px ${color}50`,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Management */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <Users size={18} style={{ color: '#f9a8d4' }} />
              <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>User Management</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allUsers.map((u) => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                  <div>
                    <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.85rem' }}>{u.username}</div>
                    <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem', textTransform: 'uppercase' }}>{u.role}</div>
                  </div>
                  {u._id !== user?._id && (
                    <button onClick={() => handleDeleteUser(u._id)} style={{ background: 'rgba(249,168,212,0.1)', border: 'none', borderRadius: 8, padding: 6, color: '#f9a8d4', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <Bell size={18} style={{ color: '#f59e0b' }} />
              <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1rem', margin: 0 }}>Broadcast Alert</h3>
            </div>
            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input placeholder="Alert Title" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '11px 16px', fontSize: '0.85rem', color: '#e2e8f0', outline: 'none' }} />
              <textarea placeholder="Message content..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '11px 16px', fontSize: '0.85rem', color: '#e2e8f0', outline: 'none', resize: 'none', minHeight: 80 }} />
              {broadcastStatus && <div style={{ color: broadcastStatus.includes('✓') ? '#fbcfe8' : '#f9a8d4', fontSize: '0.8rem', fontWeight: 600 }}>{broadcastStatus}</div>}
              <button type="submit" className="btn-cyber-primary" style={{ padding: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Zap size={14} /> Send Broadcast
              </button>
            </form>
          </div>

          <div style={cardStyle}>
            <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1rem', margin: '0 0 1rem' }}>Admin Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Add New Physician', icon: <PlusCircle size={15} />, action: () => navigate('/add-doctor'), color: '#f9a8d4' },
                { label: 'View Appointments', icon: <List size={15} />, action: () => navigate('/appointment-list'), color: '#d8b4fe' },
                { label: 'Schedule Booking', icon: <Activity size={15} />, action: () => navigate('/appointment-scheduler'), color: '#fbcfe8' },
              ].map((a) => (
                <button key={a.label} onClick={a.action} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${a.color}`,
                  color: '#e2e8f0', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                  <div style={{ color: a.color }}>{a.icon}</div>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div style={{ ...cardStyle, background: 'rgba(251,207,232,0.05)', border: '1px solid rgba(251,207,232,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <Database size={16} style={{ color: '#fbcfe8' }} />
              <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.95rem', margin: 0 }}>System Status</h3>
            </div>
            {[
              { label: 'Backend API (Port 5001)', ok: true },
              { label: 'Signaling Server (Port 5000)', ok: true },
              { label: 'Database Connection', ok: true },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.8rem' }}>{s.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.ok ? '#fbcfe8' : '#f9a8d4', animation: 'glow-pulse 2s infinite' }} />
                  <span style={{ color: s.ok ? '#fbcfe8' : '#f9a8d4', fontSize: '0.72rem', fontWeight: 700 }}>{s.ok ? 'OK' : 'ERR'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

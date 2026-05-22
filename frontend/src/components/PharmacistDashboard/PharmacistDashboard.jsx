import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, Package, AlertTriangle, CheckCircle, Activity, TrendingUp, RefreshCw, ChevronDown, Plus, X, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BASE = 'http://localhost:5001';

const card = {
  background: 'rgba(6,9,20,0.8)', backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem',
};

const PharmacistDashboard = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions]   = useState([]);
  const [inventory, setInventory]           = useState([]);
  const [activeTab, setActiveTab]           = useState('pending');
  const [loading, setLoading]               = useState(true);
  const [dispensing, setDispensing]         = useState({});
  const [showAddModal, setShowAddModal]     = useState(false);
  const [newMed, setNewMed] = useState({ name: '', category: '', stock: '', minStock: '50', unit: 'tablets', expiryDate: '', price: '', supplier: '' });
  const [savingMed, setSavingMed]           = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rxRes, invRes] = await Promise.all([
        axios.get(`${BASE}/prescriptions?status=active`),
        axios.get(`${BASE}/inventory`)
      ]);
      setPrescriptions(rxRes.data);
      setInventory(invRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDispense = async (rxId, patientName) => {
    setDispensing(d => ({ ...d, [rxId]: true }));
    try {
      await axios.patch(`${BASE}/prescriptions/${rxId}`, {
        status: 'dispensed',
        dispensedAt: new Date().toISOString(),
        dispensedBy: user?.username || 'Pharmacist'
      });
      setPrescriptions(prev => prev.map(p => p._id === rxId ? { ...p, status: 'dispensed' } : p));
    } catch (e) { console.error(e); }
    finally { setDispensing(d => ({ ...d, [rxId]: false })); }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault(); setSavingMed(true);
    try {
      const res = await axios.post(`${BASE}/inventory`, { ...newMed, stock: Number(newMed.stock), minStock: Number(newMed.minStock), price: Number(newMed.price) });
      setInventory(prev => [...prev, res.data]);
      setNewMed({ name: '', category: '', stock: '', minStock: '50', unit: 'tablets', expiryDate: '', price: '', supplier: '' });
      setShowAddModal(false);
    } catch (e) { console.error(e); }
    finally { setSavingMed(false); }
  };

  const handleUpdateStock = async (id, newStock) => {
    try {
      await axios.patch(`${BASE}/inventory/${id}`, { stock: Number(newStock) });
      setInventory(prev => prev.map(item => item._id === id ? { ...item, stock: Number(newStock) } : item));
    } catch (e) { console.error(e); }
  };

  const pending   = prescriptions.filter(p => p.status === 'active');
  const dispensed = prescriptions.filter(p => p.status === 'dispensed');
  const lowStock  = inventory.filter(i => i.stock <= i.minStock);
  const total     = inventory.reduce((s, i) => s + i.stock, 0);

  const statCards = [
    { label: 'Pending Rx', value: pending.length,   color: '#f9a8d4', icon: <Pill size={22} /> },
    { label: 'Dispensed Today', value: dispensed.length, color: '#fbcfe8', icon: <CheckCircle size={22} /> },
    { label: 'Low Stock Alerts', value: lowStock.length, color: '#f9a8d4', icon: <AlertTriangle size={22} /> },
    { label: 'Total Units', value: total.toLocaleString(), color: '#d8b4fe', icon: <Package size={22} /> },
  ];

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: '#e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '0.88rem' };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem clamp(1rem, 3vw, 2rem)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="neon-badge neon-badge-emerald" style={{ marginBottom: 8 }}>Dispensary</div>
          <h1 style={{ color: '#f8fafc', fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', letterSpacing: '-0.02em', margin: 0 }}>
            Pharmacist Dashboard
          </h1>
          <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Welcome, {user?.firstName || 'Pharmacist'} — University Dispensary
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} className="btn-cyber-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-cyber-primary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
            <Plus size={14} /> Add Medicine
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: `rgba(${s.color === '#f9a8d4' ? '249,168,212' : s.color === '#fbcfe8' ? '251,207,232' : s.color === '#f9a8d4' ? '249,168,212' : '216,180,254'},0.12)`, border: `1px solid ${s.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: '1.6rem', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.78rem', marginTop: 4 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Prescriptions Panel */}
        <div style={{ ...card, gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
            {['pending', 'dispensed'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '6px 16px', borderRadius: 999, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize',
                  background: activeTab === tab ? 'linear-gradient(135deg, #f9a8d4, #d8b4fe)' : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab ? '#fff' : 'rgba(148,163,184,0.6)',
                  border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                {tab} ({tab === 'pending' ? pending.length : dispensed.length})
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', border: '3px solid rgba(249,168,212,0.2)', borderTopColor: '#f9a8d4', animation: 'rotate-slow 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (activeTab === 'pending' ? pending : dispensed).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(251,207,232,0.08)', border: '1px solid rgba(251,207,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={28} color="#fbcfe8" />
              </div>
              <div>
                <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>All caught up! 🎉</div>
                <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.85rem' }}>No {activeTab} prescriptions in the queue.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
              {(activeTab === 'pending' ? pending : dispensed).map(rx => (
                <div key={rx._id} style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{rx.patientName}</div>
                    <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem' }}>{rx.doctorName} · {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : ''}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {(rx.medicines || []).map((m, i) => (
                        <span key={i} style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(216,180,254,0.1)', border: '1px solid rgba(216,180,254,0.2)', color: '#d8b4fe', fontSize: '0.68rem', fontWeight: 700 }}>{m.name}</span>
                      ))}
                    </div>
                  </div>
                  {activeTab === 'pending' && (
                    <button onClick={() => handleDispense(rx._id, rx.patientName)} disabled={dispensing[rx._id]}
                      style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #fbcfe8, #059669)', border: 'none', cursor: dispensing[rx._id] ? 'not-allowed' : 'pointer', color: '#fff', fontSize: '0.8rem', fontWeight: 700, opacity: dispensing[rx._id] ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={14} /> {dispensing[rx._id] ? '...' : 'Dispense'}
                    </button>
                  )}
                  {activeTab === 'dispensed' && (
                    <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(251,207,232,0.1)', border: '1px solid rgba(251,207,232,0.25)', color: '#fbcfe8', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>✓ Dispensed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Panel */}
        <div style={{ ...card }}>
          <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1rem', margin: '0 0 1rem' }}>Medicine Inventory</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
            {inventory.map(item => {
              const pct = Math.min(100, Math.round((item.stock / Math.max(item.minStock * 2, 1)) * 100));
              const isLow = item.stock <= item.minStock;
              const barColor = isLow ? '#f9a8d4' : pct < 60 ? '#f59e0b' : '#fbcfe8';
              return (
                <div key={item._id} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${isLow ? 'rgba(249,168,212,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.85rem' }}>{item.name}</div>
                      <div style={{ color: 'rgba(148,163,184,0.4)', fontSize: '0.72rem' }}>{item.category} · {item.unit}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isLow && <AlertTriangle size={14} style={{ color: '#f9a8d4' }} />}
                      <input type="number" defaultValue={item.stock} onBlur={(e) => handleUpdateStock(item._id, e.target.value)}
                        style={{ width: 60, padding: '4px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.82rem', outline: 'none', textAlign: 'center' }} />
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, boxShadow: `0 0 8px ${barColor}60`, transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.68rem', color: 'rgba(148,163,184,0.4)' }}>
                    <span style={{ color: isLow ? '#f9a8d4' : 'inherit' }}>{item.stock} {item.unit}</span>
                    <span>Min: {item.minStock}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: 480, background: 'rgba(6,9,20,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(251,207,232,0.2)', borderRadius: 20, padding: '2rem', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', animation: 'fade-up 0.3s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Add Medicine to Inventory</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMedicine} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {[['name','Medicine Name','e.g. Paracetamol 500mg'],['category','Category','e.g. Analgesic'],['supplier','Supplier','e.g. Cipla']].map(([f, l, ph]) => (
                <div key={f}>
                  <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{l}</div>
                  <input type="text" placeholder={ph} value={newMed[f]} onChange={(e) => setNewMed(p => ({ ...p, [f]: e.target.value }))} style={inputStyle} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                {[['stock','Stock','0'],['minStock','Min Stock','50'],['price','Price (₹)','0']].map(([f, l, ph]) => (
                  <div key={f}>
                    <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{l}</div>
                    <input type="number" placeholder={ph} value={newMed[f]} onChange={(e) => setNewMed(p => ({ ...p, [f]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Unit</div>
                  <select value={newMed.unit} onChange={(e) => setNewMed(p => ({ ...p, unit: e.target.value }))} style={{ ...inputStyle, appearance: 'none' }}>
                    {['tablets','capsules','ml','mg','grams','units'].map(u => <option key={u} value={u} style={{ color: '#000' }}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Expiry Date</div>
                  <input type="date" value={newMed.expiryDate} onChange={(e) => setNewMed(p => ({ ...p, expiryDate: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
              </div>
              <button type="submit" disabled={savingMed} className="btn-cyber-primary" style={{ padding: '12px', marginTop: 4, background: 'linear-gradient(135deg, #fbcfe8, #059669)', opacity: savingMed ? 0.7 : 1 }}>
                <Zap size={15} /> {savingMed ? 'Adding...' : 'Add to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistDashboard;

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Zap } from 'lucide-react';

const SUGGESTIONS = [
  'Is the campus pharmacy open now?',
  'Book an urgent care appointment',
  'Check my prescription status',
  'Nearest emergency doctor on duty',
];

const AI_RESPONSES = {
  'Is the campus pharmacy open now?': '✅ University dispensary is **OPEN** — operating hours 08:00–20:00. Current queue: 3 patients. Estimated wait: 8 minutes.',
  'Book an urgent care appointment': '📅 Redirecting to the **Smart Scheduler**. I found 4 available slots with Dr. Patel today. Would you like me to auto-book the nearest one?',
  'Check my prescription status': '💊 Your active prescriptions: **Paracetamol 500mg** (Ready) · **Amoxicillin 250mg** (Pending pharmacy verification — ETA 2h).',
  'Nearest emergency doctor on duty': '🚑 **Dr. Aman Singh** is currently on-duty at Campus Health Center Room 204. Direct telehealth link available. Connect now?',
};

const AiAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hello! I\'m **MedCore AI** — your campus health intelligence assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages((m) => [...m, { from: 'user', text: userMsg }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = AI_RESPONSES[userMsg] || `Understood. I'm analyzing your query: **"${userMsg}"**. Connecting to campus health intelligence network...`;
      setMessages((m) => [...m, { from: 'ai', text: reply }]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  const renderText = (text) =>
    text.split('**').map((part, i) =>
      i % 2 === 1 ? <strong key={i} style={{ color: '#f9a8d4' }}>{part}</strong> : part
    );

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Orb Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 60, height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(249,168,212,0.5), 0 0 60px rgba(216,180,254,0.2)',
            animation: 'glow-pulse 3s ease-in-out infinite',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageSquare size={24} color="#fff" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          style={{
            width: 360,
            maxHeight: 520,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(6, 9, 20, 0.92)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(249,168,212,0.15)',
            overflow: 'hidden',
            animation: 'fade-up 0.35s ease both',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(90deg, rgba(249,168,212,0.08), rgba(216,180,254,0.06))',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 15px rgba(249,168,212,0.5)',
              }}>
                <Zap size={16} color="#fff" />
              </div>
              <div style={{
                position: 'absolute', bottom: 1, right: 1,
                width: 10, height: 10, borderRadius: '50%',
                background: '#fbcfe8',
                border: '2px solid #030712',
                animation: 'glow-pulse 2s infinite',
              }} />
            </div>
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem' }}>MedCore AI</div>
              <div style={{ color: '#f9a8d4', fontSize: '0.7rem', letterSpacing: '0.05em' }}>CAMPUS HEALTH INTELLIGENCE</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                cursor: 'pointer', color: 'rgba(148,163,184,0.6)', padding: 4,
                borderRadius: 8, transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(148,163,184,0.6)')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '9px 14px',
                  borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg, rgba(249,168,212,0.25), rgba(216,180,254,0.15))'
                    : 'rgba(255,255,255,0.04)',
                  border: msg.from === 'user'
                    ? '1px solid rgba(249,168,212,0.3)'
                    : '1px solid rgba(255,255,255,0.06)',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                }}
              >
                {renderText(msg.text)}
              </div>
            ))}
            {typing && (
              <div style={{
                alignSelf: 'flex-start', padding: '9px 14px', borderRadius: '4px 16px 16px 16px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 150, 300].map((delay) => (
                  <div key={delay} style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#f9a8d4',
                    animation: `glow-pulse 1.2s ${delay}ms ease-in-out infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  flexShrink: 0, padding: '5px 10px',
                  background: 'rgba(249,168,212,0.08)', border: '1px solid rgba(249,168,212,0.2)',
                  borderRadius: 999, color: '#f9a8d4', fontSize: '0.7rem', fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(249,168,212,0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(249,168,212,0.08)'; }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 10, alignItems: 'center',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Ask MedCore AI anything..."
              style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                padding: '9px 14px', color: '#e2e8f0', fontSize: '0.85rem',
                outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(249,168,212,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
            <button
              onClick={() => send(input)}
              style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(249,168,212,0.3)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;

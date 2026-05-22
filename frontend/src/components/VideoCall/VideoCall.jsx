import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import {
  Mic, MicOff, Video, VideoOff, Phone, PhoneOff,
  MessageSquare, Monitor, X, Send
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const SOCKET_URL = 'http://localhost:5001';
const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

// ─── Inline Style Tokens ───────────────────────────────────────────────────────
const tokens = {
  bg: '#030712',
  glass: 'rgba(6,9,20,0.85)',
  border: 'rgba(249,168,212,0.18)',
  borderSubtle: 'rgba(255,255,255,0.07)',
  cyan: '#f9a8d4',
  purple: '#d8b4fe',
  emerald: '#fbcfe8',
  red: '#ef4444',
  textPrimary: '#f8fafc',
  textBody: '#e2e8f0',
  textMuted: 'rgba(148,163,184,0.6)',
};

// ─── Helper: format seconds → mm:ss ──────────────────────────────────────────
function formatDuration(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VideoCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Refs ──────────────────────────────────────────────────────────────────
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const chatBottomRef = useRef(null);
  const timerRef = useRef(null);
  const pendingCandidates = useRef([]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [peerJoined, setPeerJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── WebRTC: create peer connection ────────────────────────────────────────
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('webrtc-ice-candidate', {
          roomId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        timerRef.current = setInterval(() => {
          setCallDuration((d) => d + 1);
        }, 1000);
      }
    };

    return pc;
  }, [roomId]);

  // ── Init: getUserMedia + Socket ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1. Get local media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (!mounted) {
          // If component unmounted while waiting for camera, immediately stop and discard this stream
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera/microphone permission denied. Please allow access and refresh.'
            : `Could not access media devices: ${err.message}`
        );
        return;
      }

      // 2. Create peer connection
      pcRef.current = createPeerConnection();

      // Add local tracks
      localStreamRef.current.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, localStreamRef.current);
      });

      // 3. Connect socket
      const socket = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join-consultation-room', {
          roomId,
          userId: user?._id,
          role: user?.role,
        });
      });

      // ── Signalling handlers ───────────────────────────────────────────
      socket.on('peer-joined', async () => {
        if (!mounted) return;
        setPeerJoined(true);
        // Doctor / first joiner creates offer
        try {
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
          socket.emit('webrtc-offer', { roomId, offer });
        } catch (err) {
          console.error('Error creating offer:', err);
        }
      });

      socket.on('webrtc-offer', async ({ offer }) => {
        if (!mounted) return;
        setPeerJoined(true);
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          // Flush pending candidates
          for (const c of pendingCandidates.current) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidates.current = [];

          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socket.emit('webrtc-answer', { roomId, answer });
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      });

      socket.on('webrtc-answer', async ({ answer }) => {
        if (!mounted) return;
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          for (const c of pendingCandidates.current) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidates.current = [];
        } catch (err) {
          console.error('Error handling answer:', err);
        }
      });

      socket.on('webrtc-ice-candidate', async ({ candidate }) => {
        if (!mounted) return;
        if (pcRef.current?.remoteDescription) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error('ICE candidate error:', err);
          }
        } else {
          pendingCandidates.current.push(candidate);
        }
      });

      socket.on('consultation-chat', (msg) => {
        if (!mounted) return;
        setMessages((prev) => [...prev, msg]);
        if (!isChatOpen) setUnreadCount((n) => n + 1);
      });

      socket.on('peer-left', () => {
        if (!mounted) return;
        setPeerJoined(false);
        setRemoteStream(null);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      });
    }

    init();

    return () => {
      mounted = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset unread when opening chat
  useEffect(() => {
    if (isChatOpen) setUnreadCount(0);
  }, [isChatOpen]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  function cleanup() {
    clearInterval(timerRef.current);
    
    // Stop tracks from the video element directly
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
      localVideoRef.current.srcObject = null;
    }
    
    // Stop tracks from the stored stream ref
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }

  // ── Controls ──────────────────────────────────────────────────────────────
  function toggleMute() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((m) => !m);
  }

  function toggleCamera() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCameraOff((c) => !c);
  }

  async function toggleScreenShare() {
    if (isScreenSharing) {
      // Revert to camera
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const videoTrack = camStream.getVideoTracks()[0];
        const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === 'video');
        sender?.replaceTrack(videoTrack);

        // Replace track in local stream
        localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
        localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0]);
        localStreamRef.current.addTrack(videoTrack);

        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setIsScreenSharing(false);
      } catch (err) {
        console.error('Error reverting screen share:', err);
      }
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = displayStream.getVideoTracks()[0];
        const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === 'video');
        sender?.replaceTrack(videoTrack);

        localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
        if (localVideoRef.current) {
          const newStream = new MediaStream([
            videoTrack,
            ...localStreamRef.current.getAudioTracks(),
          ]);
          localVideoRef.current.srcObject = newStream;
        }

        videoTrack.onended = () => {
          setIsScreenSharing(false);
        };
        setIsScreenSharing(true);
      } catch (err) {
        if (err.name !== 'NotAllowedError') {
          console.error('Screen share error:', err);
        }
      }
    }
  }

  function endCall() {
    cleanup();
    navigate(-1);
  }

  function sendMessage() {
    const text = chatInput.trim();
    if (!text || !socketRef.current) return;
    const msg = {
      text,
      sender: user?.name || user?.email || 'You',
      senderId: user?._id,
      timestamp: new Date().toISOString(),
    };
    socketRef.current.emit('consultation-chat', { roomId, ...msg });
    setMessages((prev) => [...prev, { ...msg, own: true }]);
    setChatInput('');
  }

  function handleChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: tokens.bg, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 20, padding: 32,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PhoneOff size={32} color={tokens.red} />
        </div>
        <p style={{ color: tokens.textBody, textAlign: 'center', maxWidth: 420, lineHeight: 1.6 }}>
          {error}
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 28px', borderRadius: 12,
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            color: tokens.red, cursor: 'pointer', fontWeight: 600,
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const shortRoom = roomId ? `${roomId.slice(0, 8)}…` : '—';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: tokens.bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      zIndex: 99999, // Ensure it covers the global app header
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'linear-gradient(180deg, rgba(3,7,18,0.9) 0%, transparent 100%)',
      }}>
        {/* Room badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 20,
          background: 'rgba(249,168,212,0.08)', border: `1px solid ${tokens.border}`,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: peerJoined ? tokens.emerald : tokens.cyan,
            boxShadow: `0 0 8px ${peerJoined ? tokens.emerald : tokens.cyan}`,
            animation: 'glow-pulse 2s ease-in-out infinite',
          }} />
          <span style={{ color: tokens.textMuted, fontSize: 12 }}>Room</span>
          <span style={{ color: tokens.cyan, fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>
            {shortRoom}
          </span>
        </div>

        {/* Call timer */}
        <div style={{
          padding: '6px 18px', borderRadius: 20,
          background: 'rgba(6,9,20,0.7)', border: `1px solid ${tokens.borderSubtle}`,
          backdropFilter: 'blur(12px)',
          color: peerJoined ? tokens.emerald : tokens.textMuted,
          fontFamily: 'monospace', fontWeight: 700, fontSize: 15,
          letterSpacing: 2,
        }}>
          {peerJoined ? formatDuration(callDuration) : '—:——'}
        </div>

        {/* User badge */}
        <div style={{
          padding: '6px 14px', borderRadius: 20,
          background: 'rgba(216,180,254,0.08)', border: '1px solid rgba(216,180,254,0.18)',
          backdropFilter: 'blur(12px)',
          color: tokens.purple, fontSize: 12, fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {user?.role || 'User'}
        </div>
      </div>

      {/* ── Main Video Area ── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>

        {/* Remote video (full area) */}
        <div style={{
          flex: 1, position: 'relative', background: '#000',
          transition: 'margin-right 0.3s ease',
          marginRight: isChatOpen ? 320 : 0,
        }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              display: remoteStream ? 'block' : 'none',
            }}
          />

          {/* Waiting state */}
          {!peerJoined && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 28,
            }}>
              {/* Animated orb */}
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: `1.5px solid rgba(249,168,212,${0.4 - i * 0.12})`,
                    animation: `glow-pulse ${1.6 + i * 0.4}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                    transform: `scale(${1 + i * 0.28})`,
                  }} />
                ))}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(249,168,212,0.25) 0%, rgba(249,168,212,0.05) 70%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Phone size={36} color={tokens.cyan} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  color: tokens.textPrimary, fontSize: 20, fontWeight: 600,
                  marginBottom: 8, letterSpacing: 0.3,
                }}>
                  Waiting for other party to join…
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 16 }}>
                  <span style={{ color: tokens.textMuted, fontSize: 14 }}>
                    Share this room link to invite them:
                  </span>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: 8, 
                    background: 'rgba(255,255,255,0.05)', padding: '8px 16px', 
                    borderRadius: 12, border: `1px solid ${tokens.borderSubtle}` 
                  }}>
                    <span style={{ color: tokens.cyan, fontFamily: 'monospace', fontSize: 14 }}>
                      {window.location.origin}/video-call/{roomId}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/video-call/${roomId}`);
                        alert('Link copied to clipboard!');
                      }}
                      style={{ 
                        background: 'rgba(249,168,212,0.15)', border: 'none', 
                        color: tokens.cyan, padding: '4px 10px', borderRadius: 6, 
                        cursor: 'pointer', fontSize: 12, fontWeight: 600 
                      }}>
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              {/* Animated dots */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: tokens.cyan,
                    animation: `glow-pulse 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                    opacity: 0.7,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Remote offline overlay when peer left */}
          {peerJoined && !remoteStream && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <VideoOff size={48} color={tokens.textMuted} />
              <span style={{ color: tokens.textMuted, fontSize: 14 }}>
                Remote camera off
              </span>
            </div>
          )}
        </div>

        {/* ── Local PiP ── */}
        <div style={{
          position: 'absolute', bottom: 100, right: isChatOpen ? 340 : 20,
          width: 200, height: 150, borderRadius: 16,
          overflow: 'hidden', zIndex: 20,
          border: `2px solid ${tokens.cyan}`,
          boxShadow: `0 0 20px rgba(249,168,212,0.35), 0 8px 32px rgba(0,0,0,0.6)`,
          transition: 'right 0.3s ease',
          background: '#000',
        }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: isCameraOff ? 'none' : 'block',
            }}
          />
          {isCameraOff && (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'rgba(6,9,20,0.9)',
            }}>
              <VideoOff size={24} color={tokens.textMuted} />
              <span style={{ color: tokens.textMuted, fontSize: 11 }}>Camera off</span>
            </div>
          )}
          {/* You label */}
          <div style={{
            position: 'absolute', bottom: 6, left: 8,
            background: 'rgba(0,0,0,0.65)', borderRadius: 6,
            padding: '2px 8px', fontSize: 10, color: tokens.textMuted,
          }}>
            You
          </div>
          {isMuted && (
            <div style={{
              position: 'absolute', top: 6, right: 6,
              background: 'rgba(239,68,68,0.8)', borderRadius: '50%',
              width: 22, height: 22, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <MicOff size={12} color="#fff" />
            </div>
          )}
        </div>

        {/* ── Chat Panel ── */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 320, zIndex: 25,
          background: 'rgba(6,9,20,0.92)', backdropFilter: 'blur(24px)',
          borderLeft: `1px solid ${tokens.border}`,
          display: 'flex', flexDirection: 'column',
          transform: isChatOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Chat header */}
          <div style={{
            padding: '18px 16px', borderBottom: `1px solid ${tokens.borderSubtle}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={18} color={tokens.cyan} />
              <span style={{ color: tokens.textPrimary, fontWeight: 600, fontSize: 15 }}>
                Consultation Chat
              </span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 4, borderRadius: 8,
                color: tokens.textMuted,
                transition: 'color 0.2s',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(249,168,212,0.2) transparent',
          }}>
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center', color: tokens.textMuted,
                fontSize: 13, marginTop: 40,
              }}>
                No messages yet.<br />Start the conversation!
              </div>
            )}
            {messages.map((msg, idx) => {
              const isOwn = msg.own || msg.senderId === user?._id;
              return (
                <div key={idx} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: isOwn ? 'flex-end' : 'flex-start',
                }}>
                  {!isOwn && (
                    <span style={{
                      fontSize: 11, color: tokens.textMuted, marginBottom: 3,
                      paddingLeft: 4,
                    }}>
                      {msg.sender}
                    </span>
                  )}
                  <div style={{
                    maxWidth: '80%', padding: '9px 13px', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isOwn
                      ? 'rgba(249,168,212,0.18)'
                      : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isOwn ? 'rgba(249,168,212,0.25)' : tokens.borderSubtle}`,
                    color: tokens.textBody, fontSize: 13, lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>
                  <span style={{
                    fontSize: 10, color: tokens.textMuted,
                    marginTop: 3, paddingRight: isOwn ? 4 : 0, paddingLeft: isOwn ? 0 : 4,
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat input */}
          <div style={{
            padding: '12px 14px', borderTop: `1px solid ${tokens.borderSubtle}`,
            display: 'flex', gap: 8, alignItems: 'flex-end',
          }}>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKey}
              placeholder="Type a message…"
              rows={1}
              style={{
                flex: 1, resize: 'none', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${tokens.borderSubtle}`,
                color: tokens.textBody, fontSize: 13,
                padding: '10px 12px',
                outline: 'none', fontFamily: 'inherit',
                maxHeight: 100, overflowY: 'auto',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = tokens.cyan;
                e.target.style.boxShadow = `0 0 0 2px rgba(249,168,212,0.12)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = tokens.borderSubtle;
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!chatInput.trim()}
              style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: chatInput.trim()
                  ? `linear-gradient(135deg, rgba(249,168,212,0.3), rgba(216,180,254,0.2))`
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${chatInput.trim() ? tokens.border : tokens.borderSubtle}`,
                cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: chatInput.trim() ? tokens.cyan : tokens.textMuted,
                transition: 'all 0.2s',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Control Bar ── */}
      <div style={{
        position: 'relative', zIndex: 30,
        padding: '16px 24px',
        background: 'linear-gradient(0deg, rgba(3,7,18,0.95) 0%, transparent 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        {/* Mute */}
        <ControlButton
          onClick={toggleMute}
          active={isMuted}
          activeColor="rgba(239,68,68,0.2)"
          activeBorder="rgba(239,68,68,0.4)"
          tooltip={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={22} color={tokens.red} /> : <Mic size={22} color={tokens.cyan} />}
        </ControlButton>

        {/* Camera */}
        <ControlButton
          onClick={toggleCamera}
          active={isCameraOff}
          activeColor="rgba(239,68,68,0.2)"
          activeBorder="rgba(239,68,68,0.4)"
          tooltip={isCameraOff ? 'Camera On' : 'Camera Off'}
        >
          {isCameraOff ? <VideoOff size={22} color={tokens.red} /> : <Video size={22} color={tokens.cyan} />}
        </ControlButton>

        {/* Screen share */}
        <ControlButton
          onClick={toggleScreenShare}
          active={isScreenSharing}
          activeColor="rgba(216,180,254,0.2)"
          activeBorder="rgba(216,180,254,0.4)"
          tooltip={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          <Monitor size={22} color={isScreenSharing ? tokens.purple : tokens.cyan} />
        </ControlButton>

        {/* End call */}
        <button
          onClick={endCall}
          title="End Call"
          style={{
            width: 58, height: 58, borderRadius: '50%',
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            border: '2px solid rgba(239,68,68,0.5)',
            boxShadow: '0 0 24px rgba(239,68,68,0.4)',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 36px rgba(239,68,68,0.65)';
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 24px rgba(239,68,68,0.4)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <PhoneOff size={24} color="#fff" />
        </button>

        {/* Chat toggle */}
        <ControlButton
          onClick={() => setIsChatOpen((o) => !o)}
          active={isChatOpen}
          activeColor="rgba(249,168,212,0.2)"
          activeBorder={tokens.border}
          tooltip="Chat"
          badge={!isChatOpen && unreadCount > 0 ? unreadCount : null}
        >
          <MessageSquare size={22} color={isChatOpen ? tokens.cyan : tokens.textMuted} />
        </ControlButton>
      </div>

      {/* ── Global Keyframes (injected once) ── */}
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Sub-component: ControlButton ──────────────────────────────────────────────
function ControlButton({ children, onClick, active, activeColor, activeBorder, tooltip, badge }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        title={tooltip}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 50, height: 50, borderRadius: '50%',
          background: active
            ? activeColor
            : hovered
              ? 'rgba(249,168,212,0.10)'
              : 'rgba(255,255,255,0.06)',
          border: `1px solid ${active ? activeBorder : hovered ? 'rgba(249,168,212,0.3)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: hovered ? '0 0 16px rgba(249,168,212,0.2)' : 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}
      >
        {children}
      </button>
      {/* Unread badge */}
      {badge && (
        <div style={{
          position: 'absolute', top: -2, right: -2,
          width: 18, height: 18, borderRadius: '50%',
          background: '#f9a8d4', color: '#fff',
          fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #030712',
        }}>
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </div>
  );
}

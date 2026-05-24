import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const BASE_URL = 'https://scure-backend.onrender.com';

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const socketRef = useRef(null);

  // Connect socket when user logs in
  useEffect(() => {
    if (!user) { socketRef.current?.disconnect(); socketRef.current = null; return; }

    socketRef.current = io(BASE_URL, { transports: ['websocket', 'polling'] });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-user-room', user._id);
    });

    // Real-time notification
    socketRef.current.on('notification', (data) => {
      const newNotif = {
        _id: `rt_${Date.now()}`,
        ...data, read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(c => c + 1);

      // Browser notification
      if (Notification && Notification.permission === 'granted') {
        new Notification(`S-Cure: ${data.title}`, { body: data.message, icon: '/favicon.ico' });
      }
    });

    // Emergency broadcast
    socketRef.current.on('broadcast', (data) => {
      const newNotif = { _id: `bc_${Date.now()}`, ...data, read: false, createdAt: new Date().toISOString() };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(c => c + 1);
      if (Notification && Notification.permission === 'granted') {
        new Notification(`🚨 S-Cure Emergency: ${data.title}`, { body: data.message });
      }
    });

    // Appointment update
    socketRef.current.on('appointment-update', () => {
      setUnreadCount(c => c + 1);
    });

    // Fetch existing notifications from API
    fetchNotifications(user._id);

    // Request browser notification permission
    if (Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  const fetchNotifications = async (userId) => {
    try {
      const res = await fetch(`${BASE_URL}/notifications?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (e) { /* ignore */ }
  };

  const markRead = async (id) => {
    try {
      await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (e) { /* ignore */ }
  };

  const markAllRead = async () => {
    if (!user) return;
    try {
      await fetch(`${BASE_URL}/notifications/read-all/${user._id}`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) { /* ignore */ }
  };

  const refresh = () => user && fetchNotifications(user._id);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, refresh, socket: socketRef.current }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
export default NotificationContext;

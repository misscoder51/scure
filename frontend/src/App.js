import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import Header  from './components/Header';
import Footer  from './components/Footer';
import CinematicBackground from './components/CinematicBackground';
import AiAssistant         from './components/AiAssistant';

// Public pages
import Home     from './components/Home';
import Login    from './components/Auth/Login';
import Register from './components/Auth/Register';

// Dashboards
import StudentDashboard    from './components/StudentDashboard/StudentDashboard';
import DoctorDashboard     from './components/DoctorDashboard/DoctorDashboard';
import AdminDashboard      from './components/AdminDashboard/AdminDashboard';
import PharmacistDashboard from './components/PharmacistDashboard/PharmacistDashboard';

// Feature pages
import AppointmentScheduler from './components/AppointmentScheduler';
import AppointmentList      from './components/AppointmentList';
import AddDoctorForm        from './components/AddDoctorForm';
import SymptomChecker       from './components/SymptomChecker/SymptomChecker';
import PrescriptionView     from './components/Prescriptions/PrescriptionView';
import HealthRecords        from './components/HealthRecords/HealthRecords';
import VideoCall            from './components/VideoCall/VideoCall';

/* ---------- Loading Screen ---------- */
const LoadingScreen = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { 
          clearInterval(interval); 
          setFading(true);
          setTimeout(onDone, 600); 
          return 100; 
        }
        return p + Math.random() * 15;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#030712',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24,
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)',
        boxShadow: '0 0 40px rgba(249,168,212,0.6), 0 0 80px rgba(216,180,254,0.3)',
        animation: 'glow-pulse 1.5s ease-in-out infinite',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem',
      }}>
        <span role="img" aria-label="logo">⚕</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.01em',
          background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>S-Cure</div>
        <div style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>
          Campus Health Intelligence
        </div>
      </div>
      <div style={{ width: 200, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${Math.min(progress, 100)}%`,
          background: 'linear-gradient(90deg, #f9a8d4, #d8b4fe)',
          borderRadius: 999, transition: 'width 0.1s linear',
          boxShadow: '0 0 10px rgba(249,168,212,0.6)',
        }} />
      </div>
    </div>
  );
};

/* ---------- Protected Route ---------- */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

/* ---------- Smart Fallback Route ---------- */
const FallbackRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  switch (user.role) {
    case 'student': return <Navigate to="/student-dashboard" replace />;
    case 'doctor': return <Navigate to="/doctor-dashboard" replace />;
    case 'pharmacist': return <Navigate to="/pharmacist-dashboard" replace />;
    case 'admin': return <Navigate to="/admin-dashboard" replace />;
    default: return <Navigate to="/" replace />;
  }
};

/* ---------- Inner App (has access to AuthContext) ---------- */
const AppInner = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const onDone = useCallback(() => setLoading(false), []);

  return (
    <NotificationProvider>
      {loading && <LoadingScreen onDone={onDone} />}
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <CinematicBackground />
        <Header user={user} onLogout={logout} />

        <main style={{ flex: 1, paddingTop: '80px' }}>
          <Routes>
            {/* Public */}
            <Route path="/"          element={<Home />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />

            {/* Student */}
            <Route path="/student-dashboard"    element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/appointment-scheduler" element={<ProtectedRoute allowedRoles={['student']}><AppointmentScheduler /></ProtectedRoute>} />
            <Route path="/symptom-checker"      element={<ProtectedRoute allowedRoles={['student']}><SymptomChecker /></ProtectedRoute>} />
            <Route path="/prescriptions"        element={<ProtectedRoute allowedRoles={['student']}><PrescriptionView /></ProtectedRoute>} />
            <Route path="/health-records"       element={<ProtectedRoute allowedRoles={['student']}><HealthRecords /></ProtectedRoute>} />

            {/* Doctor */}
            <Route path="/doctor-dashboard"  element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/appointment-list"  element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><AppointmentList /></ProtectedRoute>} />

            {/* Pharmacist */}
            <Route path="/pharmacist-dashboard" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistDashboard /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/add-doctor"      element={<ProtectedRoute allowedRoles={['admin']}><AddDoctorForm /></ProtectedRoute>} />

            {/* Shared — Video Consultation */}
            <Route path="/video-call/:roomId" element={<ProtectedRoute allowedRoles={['student','doctor']}><VideoCall /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<FallbackRoute />} />
          </Routes>
        </main>

        <Footer />
        <AiAssistant />
      </div>
    </NotificationProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppInner />
      </Router>
    </AuthProvider>
  );
}

export default App;

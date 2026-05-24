// =============================================
// S-Cure Backend Server
// Express + Socket.io + MongoDB
// Port 5001
// =============================================


const express   = require('express');
const http      = require('http');
const { Server } = require('socket.io');
const mongoose  = require('mongoose');
const cors      = require('cors');

// Controllers & Routes
const { register, login } = require('./controllers/authController');
const doctorsRouter       = require('./routes/Doctor');
const appointmentsRouter  = require('./routes/appointmentRoutes');
const prescriptionsRouter = require('./routes/prescriptions');
const inventoryRouter     = require('./routes/inventory');
const notificationsRouter = require('./routes/notifications');
const healthRecordsRouter = require('./routes/healthRecords');
const symptomsRouter      = require('./routes/symptoms');
const usersRouter         = require('./routes/users');
const paymentsRouter      = require('./routes/payments');

const app    = express();
const server = http.createServer(app);

// ─── CORS ───────────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] }));
app.use(express.json());

// ─── SOCKET.IO ──────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Join user-specific room for targeted notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`[Socket.io] ${socket.id} joined room user_${userId}`);
  });

  // Join appointment video room (for consultation signaling)
  socket.on('join-consultation-room', ({ roomId, userId, role }) => {
    socket.join(`room_${roomId}`);
    socket.to(`room_${roomId}`).emit('peer-joined', { userId, role });
    console.log(`[Socket.io] ${userId} (${role}) joined consultation room_${roomId}`);
  });

  // WebRTC signaling relay (room-scoped)
  socket.on('webrtc-offer', ({ roomId, offer, from }) => {
    socket.to(`room_${roomId}`).emit('webrtc-offer', { offer, from });
  });

  socket.on('webrtc-answer', ({ roomId, answer, from }) => {
    socket.to(`room_${roomId}`).emit('webrtc-answer', { answer, from });
  });

  socket.on('webrtc-ice-candidate', ({ roomId, candidate, from }) => {
    socket.to(`room_${roomId}`).emit('webrtc-ice-candidate', { candidate, from });
  });

  // Real-time chat during consultation
  socket.on('consultation-chat', ({ roomId, message, from, role, timestamp }) => {
    io.to(`room_${roomId}`).emit('consultation-chat', { message, from, role, timestamp });
  });

  // Doctor availability toggle
  socket.on('doctor-available', ({ doctorId, isAvailable }) => {
    io.emit('doctor-status-update', { doctorId, isAvailable });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ─── DATABASE ────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scure';

mongoose.connect(MONGODB_URI).catch(err => console.error('Initial mongoose connect failed:', err.message));

mongoose.connection.once('open', () => {
  console.log('[DB] Database connection established');
});

// ─── ROUTES ──────────────────────────────────────────────────
// Auth
app.post('/register', register);
app.post('/login', login);

// Core resources
app.use('/doctors',        doctorsRouter);
app.use('/appointments',   appointmentsRouter);
app.use('/prescriptions',  prescriptionsRouter);
app.use('/inventory',      inventoryRouter);
app.use('/notifications',  notificationsRouter);
app.use('/health-records', healthRecordsRouter);
app.use('/symptoms',       symptomsRouter);
app.use('/users',          usersRouter);
app.use('/payments',       paymentsRouter);

// Health check
app.get('/', (req, res) => res.json({ status: 'S-Cure API Running', version: '2.0.0' }));

// ─── START ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`\n🚀 S-Cure Backend running on port ${PORT}`);
  console.log(`   REST API: http://localhost:${PORT}`);
  console.log(`   Socket.io: ws://localhost:${PORT}\n`);
});

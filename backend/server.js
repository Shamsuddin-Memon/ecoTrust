const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();
console.log("MONGO URI:", process.env.MONGO_URI);
// ─── Load environment variables ──────────────────────────
dotenv.config();

// ─── Connect to MongoDB ─────────────────────────────────
connectDB().then(() => {
  // Initialize fixed admin account after DB mounts
  const initAdmin = require('./utils/initAdmin');
  initAdmin();
});

// ─── Initialize Express ─────────────────────────────────
const app = express();

// ─── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Passport initialization ────────────────────────────
require('./config/passport');
app.use(passport.initialize());

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ngos', require('./routes/ngoRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Future module routes will be added here:
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/plantations', require('./routes/plantationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/documents', require('./routes/documentRoutes'));

// ─── Health Check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🌿 EcoTrust API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 handler ────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler (must be last) ────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🌿 EcoTrust API Server               ║
  ║   Running on: http://localhost:${PORT}      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚══════════════════════════════════════════╝
  `);
});

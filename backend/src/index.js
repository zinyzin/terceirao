// src/index.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { logger } = require('./lib/logger');
const { errorHandler } = require('./middleware/error');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const contributorRoutes = require('./routes/contributors');
const financeRoutes = require('./routes/finance');
const raffleRoutes = require('./routes/raffles');
const productRoutes = require('./routes/products');
const auditRoutes = require('./routes/audit');
const publicRoutes = require('./routes/public');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security ──
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 15 }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/contributors', contributorRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/raffles', raffleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Serve React in production ──
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.use(errorHandler);

app.listen(PORT, () => logger.info(`🐾 Server running on port ${PORT}`));

module.exports = app;

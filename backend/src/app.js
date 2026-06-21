const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS - restrict to the configured client URL in production
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Basic rate limiting to protect auth endpoints from brute force / abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/auth', authLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 + centralized error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/env');
const { rateLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

// Module routers
const listingsRouter = require('./modules/listings/listings.routes');
const bookingsRouter = require('./modules/bookings/bookings.routes');
const usersRouter = require('./modules/users/users.routes');
const paymentsRouter = require('./modules/payments/payments.routes');
const dashboardRouter = require('./modules/dashboard/dashboard.routes');

const app = express();

// ============================================================
// Security & Request Middleware
// ============================================================
app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, Postman)
    if (!origin || config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

app.use(morgan(config.isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter — applied to all routes
app.use(rateLimiter);

// ============================================================
// Health Check
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    },
  });
});

// ============================================================
// API Routes
// ============================================================
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/listings`, listingsRouter);
app.use(`${API_PREFIX}/bookings`, bookingsRouter);
app.use(`${API_PREFIX}/users`, usersRouter);
app.use(`${API_PREFIX}/payments`, paymentsRouter);
app.use(`${API_PREFIX}/dashboard`, dashboardRouter);

// ============================================================
// 404 Handler
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

// ============================================================
// Global Error Handler (MUST be last)
// ============================================================
app.use(errorHandler);

module.exports = app;

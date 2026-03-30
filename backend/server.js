'use strict';

require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config/env');

const server = app.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║      PG Admin API — Server Running           ║
╟──────────────────────────────────────────────╢
║  Port        : ${String(config.port).padEnd(28)}║
║  Environment : ${config.nodeEnv.padEnd(28)}║
║  API Base    : /api/v1                       ║
║  Health      : GET /health                   ║
╚══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

module.exports = server;

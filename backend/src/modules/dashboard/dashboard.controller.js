'use strict';

const dashboardService = require('./dashboard.service');
const { sendSuccess } = require('../../utils/apiResponse');

async function getStats(req, res) {
  const stats = await dashboardService.getStats();
  sendSuccess(res, stats);
}

async function getRecentBookings(req, res) {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const bookings = await dashboardService.getRecentBookings(limit);
  sendSuccess(res, bookings);
}

async function getRevenue(req, res) {
  const revenue = await dashboardService.getRevenueBreakdown();
  sendSuccess(res, revenue);
}

module.exports = { getStats, getRecentBookings, getRevenue };

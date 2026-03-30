'use strict';

const bookingsService = require('./bookings.service');
const { sendSuccess } = require('../../utils/apiResponse');

async function getAll(req, res) {
  const { page, limit, status } = req.query;
  const isAdmin = req.user?.app_metadata?.role === 'admin';

  const result = await bookingsService.getAllBookings({
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    status,
    // Non-admins only see their own bookings
    userId: isAdmin ? undefined : req.user.id,
  });

  sendSuccess(res, result.bookings, 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
}

async function getOne(req, res) {
  const booking = await bookingsService.getBookingById(req.params.id);
  const isAdmin = req.user?.app_metadata?.role === 'admin';

  if (!isAdmin && booking.user_id !== req.user.id) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  sendSuccess(res, booking);
}

async function create(req, res) {
  const payload = { ...req.body, user_id: req.user.id };
  const booking = await bookingsService.createBooking(payload);
  sendSuccess(res, booking, 201);
}

async function updateStatus(req, res) {
  const { status } = req.body;
  const booking = await bookingsService.updateBookingStatus(req.params.id, status);
  sendSuccess(res, booking);
}

async function cancel(req, res) {
  const isAdmin = req.user?.app_metadata?.role === 'admin';
  const booking = await bookingsService.cancelBooking(req.params.id, req.user.id, isAdmin);
  sendSuccess(res, booking);
}

module.exports = { getAll, getOne, create, updateStatus, cancel };

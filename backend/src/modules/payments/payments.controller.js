'use strict';

const paymentsService = require('./payments.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

async function getAll(req, res) {
  const { page, limit, status } = req.query;
  const isAdmin = req.user?.app_metadata?.role === 'admin';

  const result = await paymentsService.getAllPayments({
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    status,
    userId: isAdmin ? undefined : req.user.id,
  });

  sendSuccess(res, result.payments, 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
}

async function getOne(req, res) {
  const payment = await paymentsService.getPaymentById(req.params.id);
  const isAdmin = req.user?.app_metadata?.role === 'admin';

  if (!isAdmin && payment.user_id !== req.user.id) {
    return sendError(res, 'Access denied', 403);
  }
  sendSuccess(res, payment);
}

async function create(req, res) {
  const payload = { ...req.body, user_id: req.user.id };
  const payment = await paymentsService.createPayment(payload);
  sendSuccess(res, payment, 201);
}

async function updateStatus(req, res) {
  const payment = await paymentsService.updatePaymentStatus(req.params.id, req.body.status);
  sendSuccess(res, payment);
}

async function getRevenue(req, res) {
  const stats = await paymentsService.getRevenueStats();
  sendSuccess(res, stats);
}

module.exports = { getAll, getOne, create, updateStatus, getRevenue };

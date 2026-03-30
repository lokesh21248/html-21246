'use strict';

const usersService = require('./users.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

async function getAll(req, res) {
  const { page, limit, search } = req.query;
  const result = await usersService.getAllUsers({
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    search,
  });
  sendSuccess(res, result.users, 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
}

async function getMe(req, res) {
  const user = await usersService.getUserById(req.user.id);
  sendSuccess(res, user);
}

async function getOne(req, res) {
  const isAdmin = req.user?.app_metadata?.role === 'admin';
  if (!isAdmin && req.params.id !== req.user.id) {
    return sendError(res, 'Access denied', 403);
  }
  const user = await usersService.getUserById(req.params.id);
  sendSuccess(res, user);
}

async function update(req, res) {
  const isAdmin = req.user?.app_metadata?.role === 'admin';
  if (!isAdmin && req.params.id !== req.user.id) {
    return sendError(res, 'You can only update your own profile', 403);
  }
  const user = await usersService.updateUser(req.params.id, req.body);
  sendSuccess(res, user);
}

async function getStats(req, res) {
  const stats = await usersService.getUserStats(req.params.id);
  sendSuccess(res, stats);
}

module.exports = { getAll, getMe, getOne, update, getStats };

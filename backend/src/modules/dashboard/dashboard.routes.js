'use strict';

const { Router } = require('express');
const controller = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/adminRole');
const { asyncHandler } = require('../../utils/asyncHandler');

const router = Router();

// All dashboard routes: admin only
router.use(authenticate, requireAdmin);

router.get('/stats', asyncHandler(controller.getStats));
router.get('/recent-bookings', asyncHandler(controller.getRecentBookings));
router.get('/revenue', asyncHandler(controller.getRevenue));

module.exports = router;

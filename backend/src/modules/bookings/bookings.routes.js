'use strict';

const { Router } = require('express');
const controller = require('./bookings.controller');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/adminRole');
const { asyncHandler } = require('../../utils/asyncHandler');

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.get('/', asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', asyncHandler(controller.create));
router.delete('/:id', asyncHandler(controller.cancel));

// Admin only — status management
router.patch('/:id/status', requireAdmin, asyncHandler(controller.updateStatus));

module.exports = router;

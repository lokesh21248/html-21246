'use strict';

const { Router } = require('express');
const controller = require('./payments.controller');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/adminRole');
const { asyncHandler } = require('../../utils/asyncHandler');

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.getAll));
router.get('/revenue', requireAdmin, asyncHandler(controller.getRevenue));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', asyncHandler(controller.create));
router.patch('/:id/status', requireAdmin, asyncHandler(controller.updateStatus));

module.exports = router;

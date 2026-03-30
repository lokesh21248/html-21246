'use strict';

const { Router } = require('express');
const controller = require('./listings.controller');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/adminRole');
const { asyncHandler } = require('../../utils/asyncHandler');

const router = Router();

// Public — anyone can browse listings
router.get('/', asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getOne));

// Admin only — write operations
router.post('/', authenticate, requireAdmin, asyncHandler(controller.create));
router.put('/:id', authenticate, requireAdmin, asyncHandler(controller.update));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(controller.remove));

module.exports = router;

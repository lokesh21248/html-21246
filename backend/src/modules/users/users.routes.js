'use strict';

const { Router } = require('express');
const controller = require('./users.controller');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/adminRole');
const { asyncHandler } = require('../../utils/asyncHandler');

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Own profile
router.get('/me', asyncHandler(controller.getMe));

// Admin — list all users
router.get('/', requireAdmin, asyncHandler(controller.getAll));

// Profile by ID (admin sees all, user sees own — enforced in controller)
router.get('/:id', asyncHandler(controller.getOne));
router.put('/:id', asyncHandler(controller.update));
router.get('/:id/stats', asyncHandler(controller.getStats));

module.exports = router;

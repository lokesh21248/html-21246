'use strict';

const { Router } = require('express');
const controller = require('./auth.controller');
const { asyncHandler } = require('../../utils/asyncHandler');

const router = Router();

router.post('/login', asyncHandler(controller.login));

module.exports = router;

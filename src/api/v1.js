'use strict';
const router = require('express').Router();

// Local authentication
router.post('/auth/local', require('./auth/local.js').post);

module.exports = router;

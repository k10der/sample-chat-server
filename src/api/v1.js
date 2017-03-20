'use strict';
const router = require('express').Router();

// Local authentication
router.post('/auth/local', require('./auth/local.js').post);
router.post('/users', require('./users').post);

module.exports = router;

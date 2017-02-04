'use strict';
const router = require('express').Router();

// Local authentication
router.post('/auth/local', require('./auth/local.js').post);

// Chat rooms
// Get a list of available rooms
router.get('/rooms', require('./rooms').getAll);
router.post('/rooms', require('./rooms').post);

module.exports = router;

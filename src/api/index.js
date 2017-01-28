'use strict';
const router = require('express').Router();

// Attaching v1 API
router.use('/v1', require('./v1'));

module.exports = router;

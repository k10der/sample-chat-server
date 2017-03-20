'use strict';
const async = require('async');
const Promise = require('bluebird');

/**
 * Function, that runs initialization logic
 * for the required services
 *
 * @param parameters {Object} - Current application's parameters
 */
module.exports = parameters => {
  return new Promise((resolve, reject) => {
    // Initializing redis
    require('./redis.service').init(parameters.common, parameters.redis);
    // Setting a client for a rooms service
    require('./rooms.service').init(require('./redis.service').connection);
    // Setting a client for a messages service
    require('./messages.service').init(require('./redis.service').connection);
    // Setting a client for a users service
    require('./users.service.js').init(require('./redis.service').connection);
    // Initializing auth service
    require('./auth.service').init(parameters.common, parameters.jwt)

    return resolve();
  });
};

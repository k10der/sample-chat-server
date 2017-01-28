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
    // Setting client for a Nohm
    require('nohm').Nohm.setClient(require('./redis.service').connection);
    // Initializing auth service
    require('./auth.service').init(parameters.common, parameters.jwt)

    return resolve();
  });
};

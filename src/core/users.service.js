'use strict';
const async = require('async');

const upgradeFunction = require('../utils').upgradeFunction;

let redis;

/**
 * Get user data by user's id
 *
 * @type {Function}
 * @private
 */
const _getUserById = upgradeFunction(function (userId, cb) {
  redis.hgetall(`user:${userId}`, cb);
});

/**
 * Get user's id by user's name
 *
 * @type {Function}
 * @private
 */
const _getUserIdByUsername = upgradeFunction(function (username, cb) {
  redis.get(`user:username:${username}`, cb);
});

/**
 * Function, that performs initialization logic
 *
 * @param {Object} connection - Redis connection
 */
module.exports.init = connection => {
  redis = connection;
};

module.exports.createUser = userData => {

};

/**
 * Get a user by id
 *
 * @param {number} userId - Required user's id
 * @param {function?} cb - Callback function
 */
module.exports.getUserById = (userId, cb) => {
  _getUserById(userId, cb);
};

/**
 * Get a user by username
 *
 * @param {string} username - Required username
 * @param {Function} cb - Callback function
 */
module.exports.getUserByUsername = (username, cb) => {
  async.waterfall([
    cb => {
      _getUserIdByUsername(username, cb)
    },
    (userId, cb) => {
      if (!userId) {
        // TODO change to a centralized error
        let err = new Error('User not found');
        return cb(err);
      }

      _getUserById(userId, cb);
    }
  ], (err, user) => {
    if (err) {
      return cb(err);
    }

    return cb(null, user);
  });
};

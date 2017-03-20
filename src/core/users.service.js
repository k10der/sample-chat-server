'use strict';
const async = require('async');
const uuid = require('uuid');

const createError = require('./errors.service').createError;
const upgradeFunction = require('../utils').upgradeFunction;

let redis;

/**
 * Create
 *
 * @type {Function}
 * @private
 */
const _createUser = upgradeFunction(function (userData, cb) {
  // Creating a new user data object
  let newUserData = {
    id: uuid.v4(),
    username: userData.username,
    password: userData.password,
    createdAt: (new Date()).getTime(),
  };

  // Creating a transaction
  let multi = redis.multi({pipeline: false});

  // Adding a new user
  multi.hmset(
    `model:user:entity:${newUserData.id}`,
    'id', newUserData.id,
    'username', newUserData.username,
    'password', newUserData.password,
    'createdAt', newUserData.createdAt
  );

  // Adding a user to unique user ids
  // Setting reverse username->room link
  multi.set(`model:user:by:username:${newUserData.username}`, newUserData.id);

  // Performing the transaction
  multi.exec((err, res) => {
    cb(err, newUserData);
  });
});

/**
 * Get user data by user's id
 *
 * @type {Function}
 * @private
 */
const _getUserById = upgradeFunction(function (userId, cb) {
  redis.hgetall(`model:user:entity:${userId}`, cb);
});

/**
 * Get user's id by user's name
 *
 * @type {Function}
 * @private
 */
const _getUserIdByUsername = upgradeFunction(function (username, cb) {
  redis.get(`model:user:by:username:${username}`, cb);
});

/**
 * Function, that performs initialization logic
 *
 * @param {Object} connection - Redis connection
 */
module.exports.init = connection => {
  redis = connection;
};

module.exports.createUser = (userData, cb) => {
  async.waterfall([
    // Checking if a user with given username already exists
    cb => _getUserIdByUsername(userData.username, cb),
    // Creating a new user
    (userId, cb) => {
      // If user exists
      if (userId) {
        // TODO set the correct error
        return cb(createError());
      }

      // Creating a new user
      _createUser(userData, cb);
    }
  ], (err, user) => {
    cb(err, user);
  });
};

/**
 * Get a user by id
 *
 * @param {number} userId - Required user's id
 * @param {Function?} cb - Callback function
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

'use strict';
const async = require('async');
const microtime = require('microtime');
const uuid = require('uuid');

const upgradeFunction = require('../utils').upgradeFunction;

let redis;


/**
 * Function, that performs initialization logic
 *
 * @param {Object} connection - Redis connection
 */
module.exports.init = connection => {
  redis = connection;
};

/**
 * Create message in a room
 *
 * @param {Object} user
 * @param {Object} room
 * @param {string} messageText
 * @param {Function} cb
 */
module.exports.createMessage = (user, room, messageText, cb) => {
  // Initializing a timestamp
  let createdAt = microtime.now();
  // Creating message data as a string
  let messageData = `${uuid.v4()}:${user.username}:${messageText}`;

  // Adding a new message to a room
  redis.zadd(`model:room:${room.id}:model:messages`, createdAt, messageData, err => {
    if (err) {
      return cb(err);
    }

    // Returning new message tuple
    cb(null, [messageData, createdAt])
  });
};

/**
 * Get `number` messages from `room` `since` time
 *
 * @param {Object} room - Room object
 * @param {boolean} direction - In which direction fetch messages (true => after, false => before)
 * @param {number} ts - Timestamp, that will be searched from
 * @param {number} number - Required number of messages
 * @param {Function} cb - Callback function
 */
module.exports.getMessages = (room, direction, ts, number, cb) => {
  // If timestamp is not defined
  if (!ts) {
    // Forcing number of messages to be at least 1
    number = Math.max(1, number - 1);
    // Returning last 20 messages
    return redis.zrevrange(`model:room:${room.id}:model:messages`, 0, number, 'withscores', cb);
  }

  async.waterfall([
    // Getting since message
    cb => {
      redis.zrange(`model:room:${room.id}:model:messages`, ts, ts, cb);
    },
    // Getting since message rank
    (messages, cb) => {
      redis.zrank(`model:room:${room.id}:model:messages`, messages[0], cb)
    },
    // Getting number of messages based on direction
    (rank, cb) => {
      // Declaring variables to store limits
      let from;
      let to;

      // Setting limits based on direction
      if (direction) {
        from = rank;
        to = rank + number;
      } else {
        from = rank - number;
        to = rank;
      }
      redis.zrange(`model:room:${room.id}:model:messages`, from, to, 'withscores', cb)
    },
  ], cb);
};

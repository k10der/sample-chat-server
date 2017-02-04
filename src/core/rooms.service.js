'use strict';
const async = require('async');

const upgradeFunction = require('../utils').upgradeFunction;

let redis;

/**
 * Get room data by room's id
 *
 * @type {Function}
 * @private
 */
const _getRoomById = upgradeFunction(function (roomId, cb) {
  redis.hgetall(`room:${roomId}`, cb);
});

/**
 * Get room's id by room's name
 *
 * @type {Function}
 * @private
 */
const _getRoomIdByTitle = upgradeFunction(function (title, cb) {
  redis.get(`room:title:${title}`, cb);
});

/**
 * Function, that performs initialization logic
 *
 * @param {Object} connection - Redis connection
 */
module.exports.init = connection => {
  redis = connection;
};

module.exports.createRoom = (user, roomData, cb) => {
  // Increase room counter
  async.waterfall([
    // Getting new room id
    cb => {
      redis.incr(`ids:room`, cb);
    },
    // Creating a new room
    (roomId, cb) => {
      // Initializing time of creation
      const createdAt = (new Date()).getTime();
      // Setting and performing transaction
      redis.multi()
        // Setting new room hash
        .hmset(`room:${roomId}`,
          'id', roomId,
          'title', roomData.title,
          'private', roomData.private,
          'createdAt', createdAt
        )
        // Setting reverse title->room join
        .set(`room:${roomData.title}`, roomId)
        // Adding data to a sorted set
        .zadd('members:room', createdAt, roomId)
        .get('ids:room')
        .exec(cb)
    }
  ], (err, result) => {
    if (err) {
      return cb(err);
    }
    // Returning a room id
    return cb(null, result[3])
  });
};

module.exports.getAllRooms = cb => {
  async.waterfall([
    cb => {
      redis.zrange('members:room', '0', '-1', cb);
    },
    (roomIds, cb) => {
      let multi = redis.multi({pipeline: false});
      roomIds.forEach(id => {
        multi.hgetall(`room:${id}`)
      });
      multi.exec(cb);
    }
  ], cb);
};

/**
 * Get a room by id
 *
 * @param {number} roomId - Required room's id
 * @param {function?} cb - Callback function
 */
module.exports.getRoomById = (roomId, cb) => {
  _getRoomById(roomId, cb);
};

/**
 * Get a room by title
 *
 * @param {string} title - Required title
 * @param {Function} cb - Callback function
 */
module.exports.getRoomByTitle = (title, cb) => {
  async.waterfall([
    cb => {
      _getRoomIdByTitle(title, cb)
    },
    (roomId, cb) => {
      if (!roomId) {
        // TODO change to a centralized error
        let err = new Error('Room not found');
        return cb(err);
      }

      _getRoomById(roomId, cb);
    }
  ], cb);
};

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
  redis.hgetall(`model:room:entity:${roomId}`, cb);
});

/**
 * Get room's id by room's name
 *
 * @type {Function}
 * @private
 */
const _getRoomIdByTitle = upgradeFunction(function (title, cb) {
  redis.get(`model:room:by:title:${title}`, cb);
});

/**
 * Function, that performs initialization logic
 *
 * @param {Object} connection - Redis connection
 */
module.exports.init = connection => {
  redis = connection;
};

/**
 * Create a room with the specified parameters
 *
 * @param {Object} user - User, that creates a room
 * @param {Object} roomData - Object with room parameters
 * @param {Function} cb - Callback function
 */
module.exports.createRoom = (user, roomData, cb) => {
  // Initializing time of creation
  const createdAt = (new Date()).getTime();
  // Creating a new room object
  let newRoom = {
    'title': roomData.title,
    'private': !!roomData.private,
    'createdAt': createdAt,
  };

  async.waterfall([
    // Getting new room id
    cb => {
      redis.incr(`model:room:ai:id`, cb);
    },
    // Creating a new room
    (roomId, cb) => {
      // Adding room id to the object
      Object.assign(newRoom, {id: roomId});

      // Setting and performing transaction
      redis.multi()
      // Setting new room hash
        .hmset(`model:room:entity:${newRoom.id}`,
          'id', newRoom.id,
          'title', newRoom.title,
          'private', newRoom.private,
          'createdAt', newRoom.createdAt
        )
        // Setting reverse title->room join
        .set(`model:room:by:title:${newRoom.title}`, newRoom.id)
        // Adding data to a sorted set
        .zadd('model:room:unique:id', newRoom.createdAt, newRoom.id)
        .get('model:room:ai:id')
        .exec(cb)
    }
  ], (err, result) => {
    if (err) {
      return cb(err);
    }
    // Returning a room id
    return cb(null, newRoom)
  });
};

/**
 * Delete the room with the specified parameters
 *
 * @param {Object} user - User, that deletes a room
 * @param {Object} room - Room object
 * @param {Function} cb - Callback function
 */
module.exports.deleteRoom = (user, room, cb) => {
  // TODO maybe add some user permissions check

  async.waterfall([
    // Getting room by id
    cb => _getRoomById(room.id, cb),
    // // Deleting the room
    (savedRoom, cb) => {
      if (!savedRoom) {
        // TODO change to standard error
        return cb(new Error('Room not found error.'));
      }
      // Setting and performing transaction
      redis.multi()
      // Delete room data
        .del(
          `model:room:entity:${savedRoom.id}`,
          `model:room:by:title:${savedRoom.title}`,
          `model:room:${savedRoom.id}:model:messages`
        )
        // Clear room id from available rooms
        .zrem('model:room:unique:id', savedRoom.id)
        .exec(cb)
    }
  ], (err, result) => {
    if (err) {
      return cb(err);
    }
    // Returning a previously removed room
    return cb(null, room)
  });
};

/**
 * Get all the available rooms
 *
 * @param {Function} cb - Callback function
 */
module.exports.getAllRooms = cb => {
  async.waterfall([
    /**
     * Get all room ids
     *
     * @param {Function} cb - Callback function
     */
    cb => {
      redis.zrange('model:room:unique:id', '0', '-1', cb);
    },
    /**
     * Get all room objects
     *
     * @param {string[]} roomIds - Array of room ids
     * @param {Function} cb - Callback function
     */
      (roomIds, cb) => {
      // Creating a transaction
      let multi = redis.multi({pipeline: false});
      // Adding required room to the transaction
      roomIds.forEach(id => {
        multi.hgetall(`model:room:entity:${id}`)
      });
      // Performing the transaction
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

/**
 * Check if a room with a provided id exists
 *
 * @param {Object} room - Room object
 * @param {Function} cb - Callback function
 */
module.exports.isRoomExists = (room, cb) => {
  _getRoomById(room.id, (err, room) => {
    cb(null, !!room);
  })
};

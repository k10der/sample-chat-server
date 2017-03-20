'use strict';
const async = require('async');

const RoomsService = require('../core/rooms.service');

/**
 * Create a room
 *
 * @param req
 * @param res
 */
module.exports.createRoomAction = function(req, res) {
  RoomsService.createRoom(this.user, req.room, (err, room) => {
    if (err) {
      // TODO
      console.log(err);
      return res({error: {}});
    }
    return res({data: {room}});
  });
};

/**
 * Delete a required room
 *
 * @param req
 * @param res
 */
module.exports.deleteRoomAction = function(req, res) {
  RoomsService.deleteRoom(this.user, req.room, (err, room) => {
    if (err) {
      // TODO
      console.log(err);
      return res({error: {}});
    }
    return res({data: {room}});
  });
};

/**
 * Get rooms by a request
 *
 * @param {Object} req - Request data
 * @param {Function} res - Callback function
 */
module.exports.getRoomsAction = function (req, res) {
  // Getting all the available rooms TODO
  RoomsService.getAllRooms((err, rooms) => {
    if (err) {
      return res({
        error: {

        },
      })
    }

    res({data: {rooms}});
  });
};

/**
 * Join a particular room action
 *
 * @param {Object} req - Request data
 * @param {Function} res - Callback function
 * @return {*}
 */
module.exports.joinRoomAction = function (req, res) {
  // Getting room object
  let room = req.room;

  async.waterfall([
    /**
     * Check whether a room is already joined
     *
     * @param {Function} cb - Callback function
     */
    cb => {
      // If a current socket is not in a room
      if (this.isInRoom(room.id)) {
        // TODO change to an standard error
        return cb(new Error('Room is already joined'));
      }

      // Continue further processing
      cb(null);
    },
    /**
     * Check whether a room exists
     *
     * @param {Function} cb - Callback function
     */
    cb => {
      RoomsService.isRoomExists(room, (err, exists) => {
        if (!exists) {
          // TODO change to an standard error
          return cb(new Error('Room doesn\'t exist'));
        }

        cb(null);
      })
    },
    /**
     * TODO Check whether a user can join a room
     *
     * @param {Function} cb - Callback function
     */
    cb => {
      return cb(null);
    },
    /**
     * Join the room
     *
     * @param {Function} cb - Callback function
     */
    cb => this.joinRoom(room.id, cb),
  ], err => {
    // If an error has occurred
    if (err) {
      // TODO change to an standard error
      return res({
        data: {
          roomJoined: false,
          room: {
            id: room.id,
          },
        },
        error: {
          message: 'Not joined',
          status: 400,
          statusCode: 100200,
        }
      });
    }

    // Sending a response
    res({
      data: {
        roomJoined: true,
        room: {
          id: room.id,
        },
      }
    });
  });
};

/**
 * Leave a particular room action
 *
 * @param {Object} req - Request data
 * @param {Function} res - Callback function
 * @return {*}
 */
module.exports.leaveRoomAction = function (req, res) {
  // Getting room object
  let room = req.room;

  async.waterfall([
    /**
     * Check whether a room is already joined
     *
     * @param {Function} cb - Callback function
     */
    cb => {
      // If a current socket is not in the room
      if (!this.isInRoom(room.id)) {
        // TODO change to an standard error
        return cb(new Error('User not joined to a particular room'));
      }

      // Continue further processing
      cb(null);
    },
    /**
     * Check whether the room exists
     *
     * @param {Function} cb - Callback function
     */
    cb => {
      RoomsService.isRoomExists(room, (err, exists) => {
        if (!exists) {
          // TODO change to an standard error
          return cb(new Error('Room doesn\'t exist'));
        }

        cb(null);
      })
    },
    /**
     * TODO Check whether a user can join a room
     *
     * @param {Function} cb - Callback function
     */
    cb => {
      return cb(null);
    },
    /**
     * Leave the room
     *
     * @param {Function} cb - Callback function
     */
    cb => this.leaveRoom(room.id, cb),
  ], err => {
    // If an error has occurred
    if (err) {
      // TODO change to an standard error
      return res({
        data: {
          roomLeft: false,
          room: {
            id: room.id,
          },
        },
        error: {
          message: 'Not left',
          status: 400,
          statusCode: 100201,
        }
      });
    }

    // Sending a response
    res({
      data: {
        roomLeft: true,
        room: {
          id: room.id,
        },
      }
    });
  });
};

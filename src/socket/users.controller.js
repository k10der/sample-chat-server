'use strict';

/**
 * Get users, that are in the room
 *
 * @param {Object} req - Request data
 * @param {Function} res - Callback function
 */
module.exports.getRoomUsers = function(req, res) {
  // Getting room object
  let room = req.room || {};

  // Check whether a room is joined
  if (room.id && !this.isInRoom(room.id)) {
    // TODO change to an standard error
    return res(new Error('Room doesn\'t exist.'));
  }

  return res({
    data: {
      room: {
        id: room.id,
      },
      users: this.server.roomUsers[room.id] || [],
    },
  });
};

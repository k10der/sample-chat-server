'use strict';
const UserService = require('../core/users.service.js');
/**
 * Join a particular room action
 *
 * @param {Object} req - Request data
 * @param {Function} res - Callback function
 * @return {*}
 */
module.exports.joinRoomAction = function (req, res) {
  // TODO check if a user can join a particular room
  if (true) {
    this.join(req.room.id);
    res({
      data: {
        roomJoined: true,
        room: {
          id: req.room.id,
        },
      }
    });
  } else {
    cb({
      data: {
        roomJoined: false,
        room: {
          id: req.room.id,
        },
      },
      error: {
        message: 'Not joined',
        status: 400,
        statusCode: 100200,
      }
    });
  }
};

/**
 * Send message to a room action
 *
 * @param {Object} req - Request data
 * @param {Function} res - Callback function
 * @return {*}
 */
module.exports.sendMessageAction = function (req, res) {
  // Setting local variables for a required data
  let room = req.room;
  let message = req.message;

  // If the client isn't connected to the specified room
  if (!this.rooms.hasOwnProperty(room.id)) {
    return res({
      error: {
        message: 'No room with the provided id exists',
        status: 100001,
        statusCode: 400,
      }
    });
  }

  let messageId = process.hrtime();
  messageId = messageId[0] * 1e9 + messageId[1];

  let newMessage = {
    id: messageId,
    user: this.id,
    text: message.text,
    createdAt: new Date(),
  };
  // TODO adding message to a db

  // Broadcasting message to clients
  this.broadcast.to(room.id).emit('room_message', {
    room: {id: room.id},
    message: newMessage,
  });

  res({messageId});
};

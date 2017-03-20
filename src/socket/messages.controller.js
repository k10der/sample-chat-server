'use strict';
const MessagesService = require('../core/messages.service');

/**
 * Get messages from a room
 *
 * @param {Object} req - Request data
 * @param {Function} res - Callback function
 */
module.exports.getMessagesAction = function(req, res) {
  // Getting room object
  let room = req.room || {};
  // Getting messages query object
  let messagesQuery = (req.messages || {$query: {limit: 20, after: false}}).$query;

  // Check whether a room is joined
  if (room.id && !this.isInRoom(room.id)) {
    // TODO change to an standard error
    return res(new Error('Room doesn\'t exist.'));
  }

  MessagesService.getMessages(room, messagesQuery.after, messagesQuery.timestamp, messagesQuery.limit, (err, messageTupleArray) => {
    res({
      data: {
        room: room,
        messageTupleArray,
      }
    });
  });
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
  // Getting verification token
  let verificationToken = req.verificationToken;

  // If the client isn't connected to the specified room
  if (!this.isInRoom(room.id)) {
    return res({
      error: {
        message: 'No room with the provided id exists',
        status: 100001,
        statusCode: 400,
      }
    });
  }

  // Creating a message
  MessagesService.createMessage(this.user, room, message.text, (err, messageTuple) => {
    // TODO handler error

    // Broadcasting message to clients
    this.broadcast.to(room.id).emit('room_message', {
      data: {
        room: {id: room.id},
        messageTuple: messageTuple,
      },
    });

    // Sending a response
    res({data: {verificationToken, messageTuple}});
  });
};

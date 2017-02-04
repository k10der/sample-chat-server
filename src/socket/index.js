'use strict';
const RoomsController = require('./rooms.controller');

/**
 * Function to add socket.io functionality
 * to a provided Server instance
 *
 * @param {Object} server - HTTP(S) server instance
 */
module.exports.init = server => {
  // If socket was already initialized
  if (module.exports.io) {
    // Stopping further processing
    throw new Error('Socket was already initialized.');
  }

  // Creating new socket io instance
  let io = module.exports.io = require('socket.io')(server, {
    path: '/chats',
    serveClient: false,
  });

  // Setting authorization rules
  io.use(require('./../core/auth.service.js').socketioJwtAuth);

  // Check origin
  // io.checkRequest = function (req, fn) {
  //   console.log('req', req.headers);
  //   fn(1, true);
  // };

  io.on('connection', client => {
    // Setting handler for join room event
    client.on('join_room', RoomsController.joinRoomAction);
    // Setting handler for room message event
    client.on('room_message', RoomsController.sendMessageAction);
  });

  // TODO add disconnection handler
};

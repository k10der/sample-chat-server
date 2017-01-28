'use strict';
const socketIo = require('socket.io');

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
  let io = module.exports.io = socketIo(server, {
    path: '/chats',
    serveClient: false,
  });

  // Setting authorization rules
  io.use(require('./core/auth.service').socketioJwtAuth);

  // Check origin
  // io.checkRequest = function (req, fn) {
  //   console.log('req', req.headers);
  //   fn(1, true);
  // };

  io.on('connection', client => {
    // Connect to previously connected rooms
    console.log('client connected');

    client.emit('message', {message: 'Welcome to the chat server.'});
  });
};

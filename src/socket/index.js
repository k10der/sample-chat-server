'use strict';
const MessagesController = require('./messages.controller');
const RoomsController = require('./rooms.controller');
const UsersController = require('./users.controller');
const UsersService = require('../core/users.service');

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

  // Hash to store [userId] => [socket]
  io.userSockets = {};
  // Hash to store [roomId] => [user]
  io.roomUsers = {};

  // Setting authorization rules
  io.use(require('./../core/auth.service.js').socketioJwtAuth);
  // Loading a user
  io.use((socket, next) => {
    try {
      // Getting user's data
      UsersService.getUserById(socket.decoded_token.id, (err, user) => {
        if (err) {
          return next(new Error('Internal server error'));
        }

        // Setting user's data to a socket
        socket.user = user;

        // Setting user socket to user-sockets hash
        if (!socket.server.userSockets[user.id]) {
          socket.server.userSockets[user.id] = [];
        }
        socket.server.userSockets[user.id].push(socket);

        next();
      });
    } catch (e) {
      return next(new Error('Internal server error'));
    }
  });
  // Adding function to check whether a user is joined to a particular room
  io.use((socket, next) => {
    socket.isInRoom = roomId => {
      return socket.rooms.hasOwnProperty(roomId);
    };

    socket.joinRoom = (roomId, cb) => {
      socket.join(roomId, err => {
        if (err) {
          return cb && cb(err);
        }

        // If room users is not defined
        if (!socket.server.roomUsers[roomId]) {
          socket.server.roomUsers[roomId] = [];
        }

        // If a user is not in the room
        if (!~socket.server.roomUsers[roomId].indexOf(socket.user)) {
          socket.server.roomUsers[roomId].push(socket.user);
        }

        // TODO unsafe!!!!
        socket.broadcast.to(roomId).emit('user_joined_room', {data: {room: {id: roomId}, user: socket.user}});

        cb && cb();
      });
    };

    socket.leaveRoom = (roomId, cb) => {
      socket.leave(roomId, err => {
        if (err) {
          return cb && cb(err);
        }

        // If room users is not defined
        if (!socket.server.roomUsers[roomId]) {
          socket.server.roomUsers[roomId] = [];
        }

        // If a user is not in the room
        if (~socket.server.roomUsers[roomId].indexOf(socket.user)) {
            socket.server.roomUsers[roomId]
              .splice(socket.server.roomUsers[roomId].indexOf(socket.user), 1);
        }

        // TODO unsafe!!!!
        socket.broadcast.to(roomId).emit('user_left_room', {data: {room: {id: roomId}, user: socket.user}});

        cb && cb();
      });
    };
    next();
  });

  // Check origin
  // io.checkRequest = function (req, fn) {
  //   console.log('req', req.headers);
  //   fn(1, true);
  // };

  io.on('connection', socket => {
    socket.on('disconnecting', () => {
      Object.keys(socket.rooms).forEach(roomId => socket.leaveRoom(roomId));
      // TODO remove user from users list
    });
    /** Rooms events */
    // Setting handler for join room event
    socket.on('create_room', RoomsController.createRoomAction);
    socket.on('delete_room', RoomsController.deleteRoomAction);
    socket.on('get_rooms', RoomsController.getRoomsAction);
    socket.on('join_room', RoomsController.joinRoomAction);
    socket.on('leave_room', RoomsController.leaveRoomAction);

    /** Messages events */
    // Setting handler for get messages event
    socket.on('get_room_messages', MessagesController.getMessagesAction);
    // Setting handler for room message event
    socket.on('send_room_message', MessagesController.sendMessageAction);

    /** Users events */
    // Setting handler for get room users event
    socket.on('get_room_users', UsersController.getRoomUsers);

    /** Profile events */
    socket.on('get_profile_data', function(req, res) {
      res({
        data: {
          profile: this.user,
        },
      });
    });
    //
  });
};

'use strict';

const RoomService = require('../../core/rooms.service');

/**
 * Get all the available rooms
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.getAll = (req, res, next) => {
  // Getting all the available rooms
  RoomService.getAllRooms((err, rooms) => {
    if (err) {
      console.log(err);
      // TODO
      return res.status(500).json(err)
    }

    return res.json(rooms);
  });

};

/**
 * Create a new room
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.post = (req, res, next) => {
  console.log('User', req.user);
  RoomService.createRoom(req.user, req.body, (err, roomId) => {
    if (err) {
      console.log(err);
      // TODO
      return res.status(500).json(err)
    }
    return res.json({room: {id: roomId}});
  });
};

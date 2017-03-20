'use strict';
const UserService = require('../../core/users.service');

module.exports.post = (req, res, next) => {
  let user = req.body.user;

  UserService.createUser(user, (err, user) => {
    if (err) {
      return next(err);
    }

    return res.json(user);
  })
};

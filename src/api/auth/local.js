'use strict';
const passport = require('passport');

const AuthService = require('../../core/auth.service');

module.exports.post = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    // If an error occurred
    if (err) {
      return next(err);
    }
    // If a user isn't found
    if (!user) {
      return res.status(401).json({message: 'Invalid credentials provided.'});
    }

    return res.json({token: AuthService.createToken(user)});
  })(req, res, next);
};

'use strict';
const async = require('async');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const socketioJwt = require('socketio-jwt');

const UserService = require('./users.service.js');

const createJwtMiddleware = parameters => {
  // Creating and publishing express JWT middleware
  module.exports.jwtMiddleware = (req, res, next) => {
    // Setting processing logic
    async.waterfall([
      // Processing JWT
      cb => (expressJwt({
        secret: parameters.secret,
        userProperty: 'tokenPayload',
      }))(req, res, cb),
      // Loading user
      cb => {
        // Getting id from token payload
        const userId = parseInt(req.tokenPayload.id);

        // TODO change to better error description
        if (!userId) {
          return cb('Error');
        }

        UserService.getUserById(userId, (err, user) => {
          // If an error has occurred
          if (err) {
            // Stopping further processing
            return cb(err);
          }
          // Setting a user property
          req.user = user;

          // Continue further processing
          cb();
        });
      }
    ], err => {
      if (err) {
        return next(err);
      }

      next();
    });
  };
};

/**
 * Auth service initialization function
 *
 * @param commonParameters
 * @param parameters
 */
module.exports.init = (commonParameters, parameters) => {
  // Creating and publishing JWT middleware
  createJwtMiddleware(parameters);

  // Creating and publishing socket.io JWT middleware
  module.exports.socketioJwtAuth = socketioJwt.authorize({
    secret: parameters.secret,
    handshake: true,
  });

  // Creating and publishing a function to generate user tokens
  module.exports.createToken = user => {
    return jwt.sign({id: user.id}, parameters.secret, {expiresIn: parameters.expiresIn})
  };
};

// Adding local strategy parameters
passport.use(new LocalStrategy((username, password, done) => {
  async.waterfall([
    // Searching for a user
    cb => {
    UserService.getUserByUsername(username, cb);
    },
    // Trying to get user's data
    (user, cb) => {
      // If `user` is empty
      if (!user) {
        return cb(new Error('Wrong credentials provided.'));
      }

      // Checking user's password TODO change to a centralized error
      user.password === password ? cb(null, user) : cb(new Error('Wrong password'));
    },
  ], (err, user) => {
    // If an error occurred
    if (err) {
      // Stopping further processing
      return done(err);
    }

    done(null, user);
  });
}));

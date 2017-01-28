'use strict';
const async = require('async');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const socketioJwt = require('socketio-jwt');

const User = require('./common/user/user.model');

/**
 * Auth service initialization function
 *
 * @param commonParameters
 * @param parameters
 */
module.exports.init = (commonParameters, parameters) => {
  // Creating and publishing express JWT middleware
  module.exports.jwtMiddleware = expressJwt({
    secret: parameters.secret,
  });

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
      User.findAndLoad({
        username: username,
      }, cb);
    },
    // Trying to get user's data
    (users, cb) => {
    // If `users` array is empty
      if (!users.length) {
        return cb(new Error('Wrong credentials provided.'));
      }

      // Checking user's password
      users[0].checkPassword(password, cb);
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

// Setting serialization logic
passport.serializeUser((user, done) => {
  return done(null, user.id);
});

// Setting deserialization logic
passport.deserializeUser((id, done) => {
  User.findAndLoad({
    id: id,
  }, (err, users) => {
    // If an error has occurred
    if (err) {
      // Stopping further processing
      return done(err);
    }

    // Setting a user
    done(null, users[0]);
  });
});

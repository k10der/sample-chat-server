'use strict';

const bodyPraser = require('body-parser');
const cors = require('express-cors');
const express = require('express');
const passport = require('passport');

module.exports.init = (parametersCommon) => {
  // Initializing an app
  const app = express();

  // Attaching and configuring app middleware
  app.use(passport.initialize());
  app.use(bodyPraser.json());
  app.use(bodyPraser.urlencoded({extended: false}));
  app.use(cors({
    allowedOrigins: parametersCommon.allowedOrigins,
    allowCredentials: true,
    headers: [
      'Authorization',
      'Content-Type',
    ]
  }));

  // Adding `unless` functionality to authMiddleware
  let authMiddleware = require('./core/auth.service').jwtMiddleware;
  authMiddleware.unless = require('express-unless');

  // app.use(authMiddleware.unless({
  //   path: [
  //     /\/api\/v1\/auth\/.*/,
  //   ],
  // }));

  // Attaching routes and middleware
  app.use('/api', require('./api'));
  // Attaching unified error handler
  app.use((err, req, res, next) => {
    return res.status(err.statusCode).json(err);
  });

  return app;
};

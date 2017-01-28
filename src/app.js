'use strict';

const bodyPraser = require('body-parser');
const express = require('express');
const expressJWT = require('express-jwt');
const passport = require('passport');

// Initializing an app
const app = express();

// Attaching and configuring app middleware
app.use(passport.initialize());
app.use(bodyPraser.json());
app.use(bodyPraser.urlencoded({extended: false}));
app.use('*', function (req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Credentials', 'true');
  next();
});

// Exporting the app
module.exports.app = app;

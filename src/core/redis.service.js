'use strict';
const redis = require('redis');

module.exports.init = (commonParameters, parameters) => {
  const client = redis.createClient({
    host: parameters.host,
  });

  client.on('error', e => {
    // TODO
    console.log(e);
  });

  client.on('connect', () => {
    // TODO
    console.log('connected');
  });

  module.exports.connection = client;
};

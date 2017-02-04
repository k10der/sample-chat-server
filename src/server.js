// Getting parameters
const parameters = require('../parameters.json');

// Running initialization logic
require('./core/init')(parameters)
  .then(() => {
    // Initializing an app
    const app = require('./app').init(parameters.common);
    // Creating a server and attaching the app as a handler
    const server = new require('http').Server(app);

    // Attaching socket.io to server
    require('./socket').init(server);

    // Starting the app
    server.listen(parameters.common.port);
  })
  .catch(err => {
  });

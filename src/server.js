// Initializing an app
const app = require('./app').app;
// Creating a server and attaching the app as a handler
const server = new require('http').Server(app);
// Getting parameters
const parameters = require('../parameters.json');

// Running initialization logic
require('./core/init')(parameters)
  .then(() => {
    // Attaching routes and middleware
    app.use('/api', require('./api'));
    // Attaching socket io to server
    require('./socket').init(server);

    // Starting the app
    server.listen(3000);
  })
  .catch(err => {
  });

var argv = require('optimist').argv,
    spawn = require('child_process').spawn,
    server = require('./server');

var port = argv.port || 5510;

server(port);

if (!argv.headless) {
  spawn('xdg-open', ['http://localhost:' + port]);
}

var _ = require('underscore'),
    fs = require('fs'),
    argv = require('optimist').argv,
    spawn = require('child_process').spawn,
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    errno = require('errno'),
    mpd = require('mpd'),
    mpc;

// Configuration //

var config = {
  mpdHost: 'localhost',
  mpdPort: 6600,

  read: function(callback) {
    if (fs.existsSync('./config.json')) {
      fs.readFile('./config.json', function(err, data) {
        if (err) throw err;
        _.extend(config, JSON.parse(data));
        callback();
      });
    } else {
      callback();
    }
  },
  write: function(data, callback) {
    _.extend(config, data);
    var json = JSON.stringify(config);
    fs.writeFile('./config.json', json, function(err) {
      if (err) throw err;
      callback();
    });
  }
};

// HTTP Server //

app
  .use(express.logger())
  .get('/', function(req, res) { res.sendfile(__dirname + '/client.html'); })
  .get('/js', function(req, res) { res.sendfile(__dirname + '/client.js'); });

// MPD Connection //

mpd.reconnect = function(fn) {
  mpd.connected = false;
  mpc = mpd.connect({host: config.mpdHost, port: config.mpdPort});

  mpc.on('ready', function() {
    mpd.connected = true;
    io.sockets.emit('mpd connection');
    if (fn) fn();
  });

  mpc.on('error', function(err) {
    if (!mpd.connected) {
      io.sockets.emit('mpd connection', 'Error: ' + errno.code[err.code].description);
    }
    console.log(err);
  });
}

// Web Sockets //

io.sockets.on('connection', function(socket) {
  socket.emit('config', config);

  if (!mpd.connected) mpd.reconnect();

  socket.on('config', function(data, fn) {
    config.write(data, function() {
      socket.broadcast.emit('config', data);
      fn();
    });
  });

  socket.on('reconnect', function(fn) {
    mpd.reconnect(fn);
  });
});

// Start //

config.read(mpd.reconnect);

var port = argv.port || 5510;
server.listen(port);

if (!argv.headless) {
  spawn('xdg-open', ['http://localhost:' + port]);
}

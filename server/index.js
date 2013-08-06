var config = require('./config'),
    client = require('./client'),
    server = require('http').createServer(client),
    io = require('socket.io').listen(server),
    errno = require('errno'),
    mpd = require('./mpd'),
    mpc, connected;

function poll() {
  if (!connected) return;

  mpc.cmd('status', function(err, data) {
    // TODO: Handle error
    mpc.state = data.state
    io.sockets.emit('mpd status', data);
  });
  mpc.cmd('currentsong', function(err, data) {
    // TODO: Handle error
    io.sockets.emit('mpd currentsong', data);
  });
}

function reconnect(fn) {
  connected = false;
  mpc = mpd.connect({host: config.mpdHost, port: config.mpdPort});

  mpc.on('ready', function() {
    connected = true;
    io.sockets.emit('mpd connect');
    if (fn) fn();
  });

  mpc.on('error', function(err) {
    if (!connected) {
      io.sockets.emit('mpd connect', 'Error: ' + errno.code[err.code].description);
      if (fn) fn(err);
    }
    // TODO: Report error
  });

  mpc.on('system-player', poll);
}

io.sockets.on('connection', function(socket) {
  socket.emit('config', config);

  if (connected) {
    socket.emit('mpd connect');
    poll();
  } else {
    reconnect(poll);
  }

  socket.on('config', function(data, fn) {
    config.write(data, function() {
      socket.broadcast.emit('config', data);
      fn();
    });
  });

  socket.on('reconnect', function() {
    reconnect(poll);
  });

  socket.on('pause', function() {
    mpc.cmd('pause', +(mpc.state == 'play'), null); // FIXME: null
  });
});

module.exports = function(port) {
  server.listen(port);
  config.read(reconnect);
}

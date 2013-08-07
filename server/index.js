var config = require('./config'),
    client = require('./client'),
    server = require('http').createServer(client),
    io = require('socket.io').listen(server),
    errno = require('errno'),
    mpd = require('./mpd'),
    mpc, connected;

function pollStatus() {
  if (!connected) return;
  mpc.cmd('status', function(err, data) {
    if (err) {
      io.sockets.emit('mpd error', err);
    } else {
      if (data.state != mpc.lastState) {
        mpc.lastState = data.state;
        io.sockets.emit('mpd state', data.state);
      }

      if (data.time != mpc.lastTime) {
        mpc.lastTime = data.time;
        var time = data.time.split(':');
        io.sockets.emit('mpd time', time[0], time[1]);
      }
    }
  });
}

function pollCurrent() {
  if (!connected) return;
  mpc.cmd('currentsong', function(err, data) {
    if (err) {
      io.sockets.emit('mpd error', err);
    } else {
      io.sockets.emit('mpd current', data);
    }
  });
}

function pollAll() {
  pollStatus();
  pollCurrent();
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
    } else {
      io.sockets.emit('mpd error', err);
    }
  });

  mpc.on('system-player', pollAll);
}

io.sockets.on('connection', function(socket) {
  socket.emit('config', config);

  if (connected) {
    socket.emit('mpd connect');
    pollAll();
  } else {
    reconnect(pollAll);
  }

  socket.on('config', function(data, fn) {
    config.write(data, function() {
      socket.broadcast.emit('config', data);
      fn();
    });
  });

  socket.on('reconnect', function() {
    reconnect(pollAll);
  });

  socket.on('pause', function() {
    mpc.cmd('pause', +(mpc.lastState == 'play'));
  });
});

module.exports = function(port) {
  server.listen(port);
  config.read(reconnect);
  setInterval(pollStatus, 1000);
}

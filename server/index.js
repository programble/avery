var config = require('./config'),
    client = require('./client'),
    server = require('http').createServer(client),
    io = require('socket.io').listen(server),
    _ = require('underscore'),
    errno = require('errno'),
    mpd = require('./mpd'),
    mpc, connected;

function pollStatus(force) {
  if (!connected) return;
  mpc.objCmd('status', function(err, data) {
    if (err) {
      io.sockets.emit('mpd error', err);
    } else {
      if (force || data.state != mpc.lastState) {
        mpc.lastState = data.state;
        io.sockets.emit('mpd state', data.state);
      }

      var mode = _.pick(data, 'random', 'repeat', 'consume');
      for (var key in mode)
        mode[key] = !!+mode[key];
      if (force || !_.isEqual(mode, mpc.lastMode)) {
        mpc.lastMode = mode;
        io.sockets.emit('mpd mode', mode);
      }

      if (data.time && (force || data.elapsed != mpc.lastTime)) {
        mpc.lastTime = data.elapsed;
        io.sockets.emit('mpd time', data.elapsed, data.time.split(':')[1]);
      }
    }
  });
}

function pollCurrent() {
  if (!connected) return;
  mpc.objCmd('currentsong', function(err, data) {
    if (err) {
      io.sockets.emit('mpd error', err);
    } else if (mpc.lastState != 'stop') {
      io.sockets.emit('mpd current', data);
    }
  });
}

function pollPlaylist() {
  if (!connected) return;
  mpc.listCmd('playlistinfo', function(err, data) {
    if (err) {
      io.sockets.emit('mpd error', err);
    } else {
      io.sockets.emit('mpd playlist', data);
    }
  });
}

function pollAll(force) {
  pollStatus(force);
  pollCurrent(force);
  pollPlaylist(force);
}

function pollAllForce() { pollAll(true); }

function reconnect(fn) {
  io.sockets.emit('mpd state', 'stop');

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

  mpc.on('system-player', function() { pollStatus(); pollCurrent(); });
  mpc.on('system-options', pollStatus);
  mpc.on('system-playlist', pollPlaylist);
}

io.sockets.on('connection', function(socket) {
  socket.emit('config', config);

  if (connected) {
    socket.emit('mpd connect');
    pollAllForce();
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

  socket.on('status', function() {
    pollStatus(true);
  });

  socket.on('pause', function() {
    mpc.cmd('pause', +(mpc.lastState == 'play'));
  });

  ['random', 'repeat', 'consume'].forEach(function(mode) {
    socket.on(mode, function() {
      mpc.cmd(mode, +!mpc.lastMode[mode]);
    });
  });

  ['shuffle', 'clear'].forEach(function(cmd) {
    socket.on(cmd, function() {
      mpc.cmd(cmd);
    });
  });
});

module.exports = function(port) {
  server.listen(port);
  config.read(reconnect);
  setInterval(pollStatus, 1000);
}

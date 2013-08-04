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

// MPD Parsing //

// FIXME: Be less hacky thanks
mpd.parse = function(data) {
  var parsed = [],
      obj = {};
  data.split('\n').forEach(function(line) {
    var sep = line.indexOf(': ');
    if (sep != -1) {
      var key = line[0].toLowerCase() + line.slice(1, sep),
          val = line.slice(sep + 2);
      if (obj[key]) {
        if (_.size(obj) == 1) obj = obj[key];
        parsed.push(obj);
        obj = {};
      }
      obj[key] = val;
    }
  });
  if (_.size(parsed)) {
    parsed.push((_.size(obj) == 1) ? _.values(obj)[0] : obj);
    return parsed;
  } else {
    return obj;
  }
}

// The MPD lib actually sucks so here are some convenience methods
mpd.prototype.cmd = function() {
  var params = _.toArray(arguments),
      cmd = _.first(params),
      fn = _.last(params),
      args = _.rest(_.initial(params));
  this.sendCommand(mpd.cmd(cmd, args), function(err, data) {
    if (_.isFunction(fn)) fn(err, err ? data : mpd.parse(data));
  });
}

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
    io.sockets.emit('mpd connect');
    if (fn) fn();
  });

  mpc.on('error', function(err) {
    if (!mpd.connected) {
      io.sockets.emit('mpd connect', 'Error: ' + errno.code[err.code].description);
    }
    if (fn) fn(err);
  });

  mpc.on('system-player', mpd.poll);
}

mpd.poll = function() {
  if (!mpd.connected) return;

  mpc.cmd('status', function(err, data) {
    io.sockets.emit('mpd status', data);
  });
  mpc.cmd('currentsong', function(err, data) {
    io.sockets.emit('mpd currentsong', data);
  });
}

// Web Sockets //

io.sockets.on('connection', function(socket) {
  socket.emit('config', config);

  if (mpd.connected) {
    socket.emit('mpd connect');
    mpd.poll();
  } else {
    mpd.reconnect(mpd.poll);
  }

  socket.on('config', function(data, fn) {
    config.write(data, function() {
      socket.broadcast.emit('config', data);
      fn();
    });
  });

  socket.on('reconnect', function() {
    mpd.reconnect(mpd.poll);
  });
});

// Start //

config.read(mpd.reconnect);

var port = argv.port || 5510;
server.listen(port);

if (!argv.headless) {
  spawn('xdg-open', ['http://localhost:' + port]);
}

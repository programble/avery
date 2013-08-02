var _ = require('underscore'),
    fs = require('fs'),
    argv = require('optimist').argv,
    spawn = require('child_process').spawn,
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mpd = require('mpd'),
    mpc;

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

config.read(function() {
  mpc = mpd.connect({host: config.mpdHost, port: config.mpdPort});
});

app.use(express.logger());

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/client.html');
});

app.get('/js', function(req, res) {
  res.sendfile(__dirname + '/client.js');
});

io.sockets.on('connection', function(socket) {
  socket.emit('config', config);

  socket.on('config', function(data, fn) {
    config.write(data, function() {
      socket.broadcast.emit('config', data);
      fn();
    });
  });
});

var port = argv.port || 5510;
server.listen(port);
if (!argv.headless) {
  spawn('xdg-open', ['http://localhost:' + port]);
}

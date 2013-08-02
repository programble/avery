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
  write: function(callback) {
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
});

var port = argv.port || 5510;
server.listen(port);
if (!argv.headless) {
  spawn('xdg-open', ['http://localhost:' + port]);
}

var argv = require('optimist').argv,
    spawn = require('child_process').spawn,
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

app.use(express.logger());

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/client.html');
});

app.get('/js', function(req, res) {
  res.sendfile(__dirname + '/client.js');
});

io.sockets.on('connection', function(socket) {
});

server.listen(5510);

if (!argv.headless) {
  spawn('xdg-open', ['http://localhost:5510']);
}

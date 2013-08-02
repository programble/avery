var express = require('express'),
    argv = require('optimist').argv,
    spawn = require('child_process').spawn,
    app = express();

app.use(express.logger());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/app.html');
});

app.listen(4000);

if (!argv.headless) {
  spawn('xdg-open', ['http://localhost:4000/']);
}

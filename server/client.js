var _ = require('underscore'),
    path = require('path'),
    express = require('express')
    app = express();

app.use(express.logger());

app.use(express.static(path.normalize(__dirname + '/../bower_components')));

_.each({
  '/': 'ui.html',
  '/css': 'ui.css',
  '/js/jquery': 'jquery.js',
  '/js/favicon': 'favicon.js',
  '/js/server': 'server.js',
  '/js/ui': 'ui.js',
  '/js/keyboard': 'keyboard.js'
}, function(file, url) {
  var filepath = path.normalize(__dirname + '/../client/' + file);
  app.get(url, function(req, res) {
    res.sendfile(filepath);
  });
});

module.exports = app;

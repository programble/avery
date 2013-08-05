var _ = require('underscore'),
    path = require('path'),
    express = require('express')
    app = express();

app.use(express.logger());

_.each({
  '/': 'ui.html',
  '/js/jquery': 'jquery.js',
  '/js/mpd': 'mpd.js',
  '/js/ui': 'ui.js'
}, function(file, url) {
  app.get(url, function(req, res) {
    res.sendfile(path.normalize(__dirname + '/../client/' + file));
  });
});

module.exports = app;

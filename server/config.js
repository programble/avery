var _ = require('underscore')
    fs = require('fs');

config = {
  mpdHost: 'localhost',
  mpdPort: 6600,

  read: function(fn) {
    if (fs.existsSync('./config.json')) {
      fs.readFile('./config.json', function(err, data) {
        if (err) throw err;
        _.extend(config, JSON.parse(data));
      });
    }
    fn();
  },

  write: function(data, fn) {
    _.extend(config, data);
    fs.writeFile('./config.json', JSON.stringify(config), function(err) {
      if (err) throw err;
      fn();
    });
  }
}

module.exports = config;
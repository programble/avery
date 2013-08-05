var _ = require('underscore')
    mpd = require('mpd');

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

module.exports = mpd;

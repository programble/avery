var _ = require('underscore')
    mpd = require('mpd');

function parseLine(line) {
  var sep = line.indexOf(': ');
  if (sep == -1) return;
  var key = line[0].toLowerCase() + line.slice(1, sep),
      val = line.slice(sep + 2);
  return [key, val];
}

function parseObject(data) {
  var obj = {};
  data.trim().split('\n').forEach(function(line) {
    var pair = parseLine(line);
    if (!pair) return obj;
    obj[pair[0]] = pair[1];
  });
  return obj;
}

function parseList(data) {
  var list = [],
      firstKey = parseLine(data)[0],
      obj;
  data.trim().split('\n').forEach(function(line) {
    var pair = parseLine(line);
    if (!pair) return list;
    if (pair[0] == firstKey) {
      if (obj) list.push(obj);
      obj = {};
    }
    obj[pair[0]] = pair[1];
  });
  if (obj) list.push(obj);
  return list;
}

// The MPD lib actually sucks so here are some convenience methods
mpd.prototype.cmd = function() {
  var args = _.toArray(arguments),
      cmd = args.shift(),
      fn = _.isFunction(_.last(args)) ? args.pop() : null;
  this.sendCommand(mpd.cmd(cmd, args), function(err, data) {
    if (fn) fn(err, data);
  });
}

mpd.prototype.objCmd = function() {
  var fn = arguments[arguments.length - 1];
  arguments[arguments.length - 1] = function(err, data) {
    fn(err, err ? data : parseObject(data));
  }
  this.cmd.apply(this, arguments);
}

mpd.prototype.listCmd = function() {
  var fn = arguments[arguments.length - 1];
  arguments[arguments.length - 1] = function(err, data) {
    fn(err, err ? data : parseList(data));
  }
  this.cmd.apply(this, arguments);
}

module.exports = mpd;

function falsify(fn) {
  return function() { fn.apply(this, arguments); return false; }
}

function rebindKeys() {
  Mousetrap.reset();

  Mousetrap.bind(config.keyPlaylist, falsify(function() {
    $('#playlist-tab').tab('show');
  }));
  Mousetrap.bind(config.keyLibrary, falsify(function() {
    $('#library-tab').tab('show');
  }));
  Mousetrap.bind(config.keySettings, falsify(function() {
    $('#settings-tab').tab('show');
  }));

  Mousetrap.bind(config.keyPause, falsify(function() {
    $('#pause').click();
  }));

  Mousetrap.bind(config.keyShuffle, falsify(function() {
    $('#shuffle').click();
  }));
  Mousetrap.bind(config.keyClear, falsify(function() {
    $('#clear').click();
  }));

  Mousetrap.bind(config.keyRandom, falsify(function() {
    $('#random').click();
  }));
  Mousetrap.bind(config.keyRepeat, falsify(function() {
    $('#repeat').click();
  }));
  Mousetrap.bind(config.keyConsume, falsify(function() {
    $('#consume').click();
  }));
}

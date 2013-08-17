var socket = io.connect(),
    config = {};

function rebindKeys() {
  Mousetrap.reset();

  Mousetrap.bind(config.keyPause, function() { $('#pause').click(); });
}

socket.on('connect', function() {
  $('#tab-bar').fadeIn();
  $('#playlist-tab').tab('show'); // TODO: Intelligently select playlist or library
});

socket.on('config', function(data) {
  $.each(data, function(k, v) {
    config[k] = v;
    var input = $('#' + k);
    if (input.is(':checkbox')) {
      input.prop('checked', v);
    } else if (input.is('.btn')) {
      input.html(v);
    } else {
      input.val(v);
    }
    input.flashGroup('has-warning');
  });

  rebindKeys();
});

socket.on('mpd connect', function(err) {
  var reconnect = $('#reconnect'),
      error = $('#reconnect-error');
  reconnect.enable();
  if (err) {
    reconnect.swapClass('btn-success', 'btn-danger');
    error.html(err);
    $('#settings-tab').tab('show');
  } else {
    reconnect.swapClass('btn-danger', 'btn-success');
    error.empty();
  }
});

socket.on('mpd state', function(state) {
  if (state == 'stop') {
    document.title = 'Avery';
    favicon(stopFavicon);
    return $('#playback-bar').fadeOut();
  }

  favicon(state == 'play' ? playFavicon : pauseFavicon);

  $('#playback-bar').fadeIn();
  $('#pause i').attr('class', state == 'play' ? 'icon-pause' : 'icon-play');
});

socket.on('mpd mode', function(mode) {
  $.each(mode, function(id, active) {
    $('#' + id).toggleClass('active', active);
  });
});

socket.on('mpd current', function(track) {
  $('#playback-title').html(track.title);
  $('#playback-artist').html(track.artist);
  document.title = track.title + ' — ' + track.artist;
});

function formatDuration(secs) {
  var mins = Math.floor(secs / 60),
      rsecs = Math.floor(secs % 60),
      s = mins + ':';
  if (rsecs.toString().length == 1) s += '0';
  s += rsecs;
  return s;
}

socket.on('mpd time', function(elapsed, total) {
  $('#playback-elapsed').html(formatDuration(elapsed));
  if (config.timeLeft) {
    $('#playback-total').html('-' + formatDuration(total - elapsed));
  } else {
    $('#playback-total').html(formatDuration(total));
  }
  $('#playback-progress').width(elapsed / total * 100 + '%');
});

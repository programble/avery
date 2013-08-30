var socket = io.connect(),
    config = {},
    currentTrack;

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
    $('#playback-bar').fadeOut();
    currentTrack = null;
    highlightCurrent();
    return;
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
  currentTrack = track;
  $('#playback-title').html(track.title);
  $('#playback-artist').html(track.artist);
  document.title = track.title + ' — ' + track.artist;
  highlightCurrent();
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

function highlightCurrent() {
  $('#playlist tr').removeClass('success');
  if (currentTrack)
    $('#' + currentTrack.id).addClass('success');
}

socket.on('mpd playlist', function(playlist) {
  $('#playlist table').toggleClass('in', !!playlist.length);
  $('#shuffle,#clear').toggleClass('disabled', !playlist.length);

  var tbody = $('#playlist table tbody').empty();
  playlist.forEach(function(track) {
    $('<tr>')
      .prop('id', track.id)
      .append($('<td>').html(track.artist))
      .append($('<td>').html(track.title))
      .append($('<td>').html(track.album))
      .append($('<td>').html(formatDuration(track.time)))
      .appendTo(tbody);
  });

  highlightCurrent();
});

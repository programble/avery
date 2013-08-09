var socket = io.connect(),
    config = {};

socket.on('connect', function() {
  $('.setting').enable();
});

socket.on('config', function(data) {
  $.each(data, function(k, v) {
    config[k] = v;
    var input = $('#' + k);
    if (input.is(':checkbox')) {
      input.prop('checked', v);
    } else {
      input.val(v);
    }
    input.flashGroup('has-warning');
  });
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
  if (state == 'stop') return $('#playback-bar').fadeOut();

  $('#playback-bar').fadeIn();
  $('#pause i').attr('class', state == 'play' ? 'icon-pause' : 'icon-play');
});

socket.on('mpd current', function(track) {
  $('#playback-title').html(track.title);
  $('#playback-artist').html(track.artist);
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
  $('#playback-total').html(formatDuration(total));
  $('#playback-progress').width(elapsed / total * 100 + '%');
});

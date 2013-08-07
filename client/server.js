var socket = io.connect();

socket.on('connect', function() {
  $('.setting').enable();
});

socket.on('config', function(config) {
  $.each(config, function(k, v) {
    $('#' + k).val(v).flashGroup('has-warning');
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

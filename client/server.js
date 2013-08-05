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

socket.on('mpd status', function(data) {
  if (data.state == 'stop') {
    $('#playback-bar').fadeOut();
  } else {
    $('#playback-bar').fadeIn();
  }

  $('#pause i').attr('class', (data.state == 'pause') ? 'icon-play' : 'icon-pause');
});

socket.on('mpd currentsong', function(data) {
  $('#playback-title').html(data.title);
  $('#playback-artist').html(data.artist);
});

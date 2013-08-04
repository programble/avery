$.fn.disable = function() {
  this.addClass('disabled');
  this.each(function() {
    if (this.nodeName == 'INPUT') $(this).attr('disabled', true);
  });
  return this;
}

$.fn.enable = function() {
  this.removeClass('disabled');
  this.each(function() {
    if (this.nodeName == 'INPUT') $(this).removeAttr('disabled');
  });
  return this;
}

$.fn.fadeIn = function() {
  return this.addClass('in');
}

$.fn.fadeOut = function() {
  return this.removeClass('in');
}

$.fn.swapClass = function(a, b) {
  return this.removeClass(a).addClass(b);
}

$.fn.flashGroup = function(klass) {
  var group = this.parents('.form-group');
  group.addClass(klass);
  setTimeout(function() {
    group.removeClass(klass);
  }, 1000);
  return this;
}

// Socket Events //

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

// UI Events //

$('.setting').change(function() {
  var input = $(this),
      config = {};
  config[input.attr('id')] = input.val();
  socket.emit('config', config, function() {
    input.flashGroup('has-success');
  });
});

$('#reconnect').click(function() {
  $(this).disable();
  $('#playback-bar').fadeOut();
  socket.emit('reconnect');
});

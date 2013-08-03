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
  socket.emit('reconnect');
});

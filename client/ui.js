$('.setting').change(function() {
  var input = $(this),
      key = input.prop('id'),
      delta = {};
  if (input.is(':checkbox')) {
    delta[key] = config[key] = input.prop('checked');
  } else {
    delta[key] = config[key] = input.val();
  }
  socket.emit('config', delta, function() {
    input.flashGroup('has-success');
  });
});

$('#reconnect').click(function() {
  $(this).disable();
  socket.emit('reconnect');
});

$('#pause').click(function() {
  socket.emit('pause');
});

$('#playback-total').click(function() {
  $('#timeLeft').prop('checked', !config.timeLeft).change();
  socket.emit('status');
});

['random', 'repeat', 'consume'].forEach(function(btn) {
  $('#' + btn).click(function() {
    $(this).toggleClass('active');
    socket.emit(btn);
  });
});

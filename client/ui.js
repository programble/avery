$('.setting').change(function() {
  var input = $(this),
      config = {};
  if (input.is(':checkbox')) {
    config[input.prop('id')] = input.prop('checked');
  } else {
    config[input.prop('id')] = input.val();
  }
  socket.emit('config', config, function() {
    input.flashGroup('has-success');
  });
});

$('#reconnect').click(function() {
  $(this).disable();
  $('#playback-bar').fadeOut();
  socket.emit('reconnect');
});

$('#pause').click(function() {
  socket.emit('pause');
});

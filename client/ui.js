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

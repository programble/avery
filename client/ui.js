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

$('.btn.setting').click(function() {
  var btn = $(this)
      key = btn.prop('id')
      delta = {};
  btn.addClass('active');
  Mousetrap.record(function(seq) {
    seq = seq.join(' ');
    btn.removeClass('active');
    btn.html(seq);
    delta[key] = config[key] = seq;
    socket.emit('config', delta, function() {
      btn.flashGroup('has-success');
      rebindKeys();
    });
  });
});

$('#reconnect').click(function() {
  $(this).disable();
  socket.emit('reconnect');
});

$('#playback-total').click(function() {
  $('#timeLeft').prop('checked', !config.timeLeft).change();
  socket.emit('status');
});

['pause', 'shuffle', 'clear'].forEach(function(btn) {
  $('#' + btn).click(function() {
    socket.emit(btn);
  });
});

['random', 'repeat', 'consume'].forEach(function(btn) {
  $('#' + btn).click(function() {
    $(this).toggleClass('active');
    socket.emit(btn);
  });
});

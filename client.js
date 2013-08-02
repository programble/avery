function flashGroup(input, klass) {
  var group = input.parents('.form-group');
  group.addClass(klass);
  setTimeout(function() {
    group.removeClass(klass);
  }, 1000);
}

var socket = io.connect();

socket.on('config', function(config) {
  $.each(config, function(k, v) {
    flashGroup($('#' + k).val(v), 'has-warning');
  });
});

$('.setting').change(function() {
  var input = $(this),
      config = new Object();
  config[input.attr('id')] = input.val();

  socket.emit('config', config, function() {
    flashGroup(input, 'has-success');
  });
});

$('#reconnect').click(function() {
  $(this).addClass('disabled');
  socket.emit('reconnect', function() {
    $('#reconnect').removeClass('disabled');
  });
});

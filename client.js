$.fn.flashGroup = function(klass) {
  var group = this.parents('.form-group');
  group.addClass(klass);
  setTimeout(function() {
    group.removeClass(klass);
  }, 1000);
}

var socket = io.connect();

socket.on('config', function(config) {
  $.each(config, function(k, v) {
    $('#' + k).val(v).flashGroup('has-warning');
  });
});

$('.setting').change(function() {
  var input = $(this),
      config = {};
  config[input.attr('id')] = input.val();

  socket.emit('config', config, function() {
    input.flashGroup('has-success');
  });
});

$('#reconnect').click(function() {
  $(this).addClass('disabled');
  socket.emit('reconnect', function() {
    $('#reconnect').removeClass('disabled');
  });
});

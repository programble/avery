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

socket.on('mpd connection', function(err) {
  $('#reconnect').removeClass('disabled');
  if (err) {
    $('#reconnect').removeClass('btn-success').addClass('btn-danger');
    $('#reconnect-error').html(err);
    $('#settings-tab').tab('show');
  } else {
    $('#reconnect').removeClass('btn-danger').addClass('btn-success');
    $('#reconnect-error').empty();
  }
});

$('#reconnect').click(function() {
  $(this).addClass('disabled');
  // TODO: Disable everything that requires a connection
  socket.emit('reconnect');
});

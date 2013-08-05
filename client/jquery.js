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

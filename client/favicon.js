var stopFavicon, playFavicon, pauseFavicon;

function favicon(icon) {
  $('#favicon').attr('href', icon).remove().appendTo('head');
}

$(function() {
  function renderIcon(text) {
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    canvas.width = canvas.height = 16;
    ctx.fillStyle = '#222';
    ctx.font = '12px FontAwesome';
    ctx.fillText(text, 3, 12);
    return canvas.toDataURL('image/png');
  }

  stopFavicon = renderIcon('\uf001');
  playFavicon = renderIcon('\uf04b');
  pauseFavicon = renderIcon('\uf04c');

  favicon(stopFavicon);
});

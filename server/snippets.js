// Server Snippets

var gm = require('gm').subClass({ imageMagick: true });
gm(path).blur(20, 30).toBuffer('JPG', function(err, buffer) {
  if (err) {
    console.log('ERROR', err);
  }
  img.src = buffer;
});


instance.on('message', function(message) {
  console.log('received: %s', message);
  var clickPos = JSON.parse(message);
  sendRegion(instance, img, {
    top: clickPos.y + 50,
    left: clickPos.x - 50,
    width: 100,
    height: 200,
  });
});


// Client snippets
canvas.addEventListener("mousedown", onMouseDown, false);

function getClickPosition(event) {
  var x = event.x;
  var y = event.y;
  x -= event.target.offsetLeft;
  y -= event.target.offsetTop;
  return {
    x: x,
    y: y,
  }
}

function onMouseDown(event) {
  var clickPos = getClickPosition(event);
  clickPos.type = 'click';
  socket.send(JSON.stringify(clickPos));
}


'use strict';
var fs = require('fs');
var Canvas = require('canvas');

var WebSocketServer = require('ws').Server

var wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: false, // enable sending binary data, bug in node-ws
 });

wss.on('connection', function(instance) {

  instance.on('message', function(message) {
    console.log('received: %s', message);
  });

  var imgName = 'image.jpg';

  fs.readFile(__dirname + '/' + imgName, function(err, data) {
    if (err) {
      throw err;
    }

    var img = new Canvas.Image; // Create a new Image
    img.src = data;

    // First send info about the data
    instance.send(JSON.stringify({
      name: imgName,
      width: img.width,
      height: img.height,
    }));

    // Initialiaze a new Canvas with the same dimensions
    // as the image, and get a 2D drawing context for it.
    var canvas = new Canvas(img.width, img.height);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var imgData = ctx.getImageData(0, 0, img.width, img.height);

    var pixels = imgData.data;
    var bytearray = new Uint8Array(pixels);

    instance.send(bytearray, { binary: true });
  });
});

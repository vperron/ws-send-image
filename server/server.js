'use strict';

var fs = require('fs');
var ru = require('./regionUtils');
var Canvas = require('canvas');
var WebSocketServer = require('ws').Server;


// Utility functions
// ------------------
function sendRegion(instance, img, coords) {
  // Now send info about the region being sent.
  var region = {
    type: 'region',
    top: coords.top,
    left: coords.left,
    width: coords.width,
    height: coords.height,
  };
  instance.send(JSON.stringify(region));

  var regionArray = ru.regionFromImage(img, coords);
  instance.send(regionArray, { binary: true });
}

function imageFromFile(path) {
  var img = new Canvas.Image; // Create a new Image
  var data = fs.readFileSync(path);
  img.src = data;
  return img;
}

var wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: false, // enable sending binary data, bug in node-ws
});


// Main code
// ---------
var imgName = __dirname + '/' + 'image.jpg';
var img = imageFromFile(imgName);

wss.on('connection', function(instance) {

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

  // First send info about the data
  instance.send(JSON.stringify({
    type: 'image',
    name: imgName,
    width: img.width,
    height: img.height,
  }));

  sendRegion(instance, img, {
    top: 50,
    left: 100,
    width: 300,
    height: 400,
  });
});

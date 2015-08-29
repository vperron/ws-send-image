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

// Computes next region from previous one
var i = 0;

var region = {
  top: 120,
  left: 120,
  width: 200,
  height: 200,
};

function sendNextRegion(socket, img) {
  sendRegion(socket, img, {
    top: region.top + i,
    left: region.left + i,
    width: region.width,
    height: region.height,
  });
  i = i + 1;
}


// Main code
// ---------
var imgName = __dirname + '/' + 'image.jpg';
var REFRESH_RATE = 1000 / 30; // 15 FPS

var wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: false, // enable sending binary data, bug in node-ws
});

wss.on('connection', function(instance) {

  var img = imageFromFile(imgName);

  // First send info about the data
  instance.send(JSON.stringify({
    type: 'image',
    name: imgName,
    width: img.width,
    height: img.height,
  }));

  setInterval(sendNextRegion, REFRESH_RATE, instance, img, region);
});

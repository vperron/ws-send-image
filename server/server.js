'use strict';

var fs = require('fs');
var Canvas = require('canvas');

var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: false, // enable sending binary data, bug in node-ws
});


function getPixel(arr, row, col) {
  return [
    arr[row + col + 0],
    arr[row + col + 1],
    arr[row + col + 2],
    arr[row + col + 3],
  ];
}

function setPixel(arr, row, col, pixel) {
  arr[row + col + 0] = pixel[0];
  arr[row + col + 1] = pixel[1];
  arr[row + col + 2] = pixel[2];
  arr[row + col + 3] = pixel[3];
}

function index2row(i, width) {
  return i * (width * 4);
}

function index2col(j) {
  return j * 4;
}

function regionFromImage(img, coords) {

  // Initialiaze a new Canvas with the same dimensions
  // as the image, and get a 2D drawing context for it.
  var canvas = new Canvas(img.width, img.height);
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);
  var imgData = ctx.getImageData(0, 0, img.width, img.height);

  var pixels = imgData.data;
  var bytearray = new Uint8Array(pixels);
  var regionArray = new Uint8Array(img.width * coords.height * 4 * 4);
  for (var i = 0; i < coords.height; i = i + 1) {
    for (var j = 0; j < coords.width; j = j + 1) {
      var row = index2row(i, img.width);
      var col = index2col(j);
      var srcPixel = getPixel(
          bytearray,
          index2row(coords.top, img.width) + row,
          index2col(coords.left) + col
        );
      setPixel(regionArray, row, col, srcPixel);
    }
  }

  return regionArray;
}

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

  var regionArray = regionFromImage(img, coords);
  instance.send(regionArray, { binary: true });
}


var imgName = 'image.jpg';
var img = new Canvas.Image; // Create a new Image

fs.readFile(__dirname + '/' + imgName, function(err, data) {
  if (err) {
    throw err;
  }
  img.src = data;
});

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

'use strict';

var pu = require('./pixelUtils');

var Canvas = require('canvas');

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
      var row = pu.index2row(i, img.width);
      var col = pu.index2col(j);
      var srcPixel = pu.getPixel(
          bytearray,
          pu.index2row(coords.top, img.width) + row,
          pu.index2col(coords.left) + col
        );
      pu.setPixel(regionArray, row, col, srcPixel);
    }
  }
  return regionArray;
}

module.exports = {
  regionFromImage: regionFromImage,
};

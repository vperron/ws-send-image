'use strict';

/* global index2row index2col getPixel setPixel */
/* eslint block-scoped-var:0 no-console:0 */

// globals and useful functions
var w = null;
var h = null;
var region = null;
var socket = null;

function handleData(msg) {
  if (!w || !h) {
    console.error('error: did not have the image size !');
    return;
  }

  // Init canvas handles
  var element = document.getElementById('image');
  var ctx = element.getContext('2d');
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  var imgData = ctx.createImageData(w, h);

  // Copy data
  var binary = new Uint8Array(msg.data);
  if (region) {
    for (var i = 0; i < region.height; i = i + 1) {
      for (var j = 0; j < region.width; j = j + 1) {
        var row = index2row(i, w);
        var col = index2col(j);
        var srcPixel = getPixel(binary, row, col);
        setPixel(
          imgData.data,
          index2row(region.top, w) + row,
          index2col(region.left) + col,
          srcPixel
        );
      }
    }
  } else {
    for (var i = 0; i < binary.length; i = i + 1) {
      imgData.data[i] = binary[i];
    }
  }

  // Draw to canvas
  ctx.putImageData(imgData, 0, 0);
}

function handleInfo(msg) {
  var imgInfo = JSON.parse(msg.data);
  if (imgInfo.type === 'image') {
    w = imgInfo.width;
    h = imgInfo.height;
  }
  if (imgInfo.type === 'region') {
    region = imgInfo;
  }
}

// Entry point
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Create websocket
    socket = new WebSocket('ws://127.0.0.1:8080');
    socket.binaryType = 'arraybuffer';
    console.log('init:', socket.readyState);

    socket.onopen = function() {
      console.log('onopen:', socket.readyState);
    };

    socket.onmessage = function(msg) {
      if (msg.data instanceof ArrayBuffer) {
        handleData(msg);
      } else {
        handleInfo(msg);
      }
    };

    socket.onclose = function() {
      console.log('onclose:', socket.readyState);
    };

  } catch(exception) {
    console.error('Error', exception);
  }
});

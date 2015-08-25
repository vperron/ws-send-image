'use strict';

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

module.exports = {
  getPixel: getPixel,
  setPixel: setPixel,
  index2row: index2row,
  index2col: index2col,
};

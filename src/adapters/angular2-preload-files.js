/**
 * Files will be loaded by SystemJS in order.
 * @type {string[]}
 */
module.exports = [
  'zone.js/dist/zone.js',
  '@angular/core/testing',
  '@angular/platform-browser-dynamic/testing',
  'zone.js/dist/jasmine-patch.js',
  'zone.js/dist/async-test.js',
  'zone.js/dist/fake-async-test.js'
];

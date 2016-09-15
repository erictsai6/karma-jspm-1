/**
 * Files will be loaded by SystemJS in order.
 * @type {string[]}
 */
module.exports = [
  // Polyfills
  'es6-shim',
  'core-js/client/shim.min.js',
  'reflect-metadata/Reflect.js',

  // Test Assistance
  'zone.js/dist/zone.js',
  'zone.js/dist/long-stack-trace-zone.js',
  'zone.js/dist/async-test.js',
  'zone.js/dist/fake-async-test.js',
  'zone.js/dist/sync-test.js',
  'zone.js/dist/proxy.js',
  'zone.js/dist/jasmine-patch.js',

  // TestBed.initTestEnvironment
  '@angular/core/testing',
  '@angular/platform-browser-dynamic/testing'
];

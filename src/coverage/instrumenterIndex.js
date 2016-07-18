/**
 * Add Instrumenter to window. This file is used for browserify.
 * @type {Instrumenter}
 */
var Instrumenter = require('../../node_modules/istanbul/lib/instrumenter.js');
window.Instrumenter = Instrumenter;

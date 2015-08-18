/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var uri = 'mongodb://localhost/test';

// expose

module.exports = mongoose.createConnection(uri);

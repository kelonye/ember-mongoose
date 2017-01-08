/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var uri = 'mongodb://localhost/test';

// promise

mongoose.Promise = Promise;

// expose

module.exports = mongoose.createConnection(uri);

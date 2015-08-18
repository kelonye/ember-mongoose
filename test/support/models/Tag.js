/**
  * Module dependencies.
  */
var config = require('../config');
var mongoose = require('mongoose');
var timestamps = require('mongoose-time');


var schema = module.exports = new mongoose.Schema(
  {
    name: String,
    post_id: String
  }, {
    versionKey: false
  }
);

schema.plugin(timestamps());

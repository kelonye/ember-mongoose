/**
  * Module dependencies.
  */
var config = require('../config');
var mongoose = require('mongoose');
var timestamps = require('mongoose-time');


var schema = module.exports = new mongoose.Schema(
  {
    name: String,
    is_super_user: Boolean
  }, {
    versionKey: false
  }
);

schema.plugin(timestamps());

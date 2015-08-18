/**
 * Module dependencies.
 */
var apis = require('../../')();
var join = require('path').join;
var config = {};


// port

config.port = 3000;


// mongo
config.mongo = require('./mongo');


// models, fields, hooks, apis

apis
  .models(config.mongo, join(__dirname, 'models'))
  .fields(join(__dirname, 'api_fields'))
  .hooks(join(__dirname, 'api_hooks'));

config.models = apis._models;

config.apis = apis;

// expose

module.exports = config;

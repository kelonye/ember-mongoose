/**
  * Module dependencies.
  */
var config = require('./config');
var express = require('express');
var debug = require('debug')('app:web');


// app

var app = module.exports = express();

// settings

app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(require('./session'));
app.use(require('./auth/passport'));

// apis

config.apis.discover(app);

// bind

if (!module.parent){
  app.listen(config.port);
  debug('listening on port '+config.port);
}
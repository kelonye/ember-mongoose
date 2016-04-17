/**
  * Module dependencies.
  */
var express = require('express');
var debug = require('debug')('app:web');
var builder = require('component-hooks');
var join = require('path').join;

// app

var app = module.exports = express();

// settings

app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(join(__dirname, '..', 'public')));
app.use(require('./session'));
app.use(require('./auth/passport'));

// apis

config.apis.discover(app);

app.get('/', function(req, res, next){

  var out = join(__dirname, '..', 'public');
  var cwd = join(__dirname, '..', 'client/app');
  var build = builder(cwd)
    .copy()
    .log()
    .standalone()
    .out(out)
    .dev()
    .end(function(err){
      if (err) return next(err);
      res.sendfile(join(__dirname, 'views/index.html'));
    });

});

/**
  * Module dependencies.
  */
var debug = require('debug')('app:web');

require('./db').setUp(function(err){

  if (err) throw err;

  var app = require('./');

  app.listen(config.port);

  debug('listening on port '+config.port);

});

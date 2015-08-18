/**
 * Module dependencies.
 */
var express = require('express');


module.exports = express.session({
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000
  },
  key: 'express.sid',
  secret: 'development secret'
});

var express = require('express');
var app = module.exports = express();
app.use(express.session({
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000
  },
  key: 'express.sid',
  secret: 'development secret'
}));

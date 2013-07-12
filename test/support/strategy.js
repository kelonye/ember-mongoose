var express = require('express');
var app = module.exports = express();
app.use(function(req, res, next) {
  req.isAuthenticated = function() {
    return true;
  };
  req.user = user;
  next();
});

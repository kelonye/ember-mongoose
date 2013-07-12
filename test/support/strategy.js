var express = require('express');
var app = module.exports = express();
var User = require('./models').User;

app.use(function(req, res, next) {
  req.isAuthenticated = function() {
    return true;
  };
  User.findById('1', function(err, user){
    if (err) return res.send(err);
    req.user = user;
    next();
  });
});

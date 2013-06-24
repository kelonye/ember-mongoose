var express = require('express')
  , app = module.exports = express();
app.use(function(req, res, next) {
  req.isAuthenticated = function() {
    return true;
  };
  req.user = user;
  return next();
});

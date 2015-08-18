/**
 * Module dependencies.
 */


module.exports = function(req, res, next) {
  req.isAuthenticated = function() {
    return true;
  };
  req.user = user;
  next();
};

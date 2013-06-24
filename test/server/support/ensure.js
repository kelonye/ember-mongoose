exports.superuser = function(req, cb) {
  var user;
  user = req.user;
  if (!req.isAuthenticated() || !user || !user.is_super_user) {
    return cb(null, 403);
  }
  return cb(null, true);
};

exports.user = function(req, cb) {
  var user = req.user;
  if (!req.isAuthenticated() || !user || !(this.user_id === user.id || user.is_super_user)) {
    return cb(null, 403);
  }
  return cb(null, true);
};

exports.any = function(req, cb) {
  return cb(null, true);
};

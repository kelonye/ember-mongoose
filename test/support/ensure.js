exports.superuser = function(req, done) {
  var user = req.user;
  if (!req.isAuthenticated() || !user || !user.is_super_user) {
    return done(null, 403);
  }
  done(null, true);
};

exports.user = function(req, done) {
  var user = req.user;
  if (!req.isAuthenticated() || !user || !(this.user_id === user.id || user.is_super_user)) {
    return done(null, 403);
  }
  done(null, true);
};

exports.any = function(req, done) {
  done(null, true);
};

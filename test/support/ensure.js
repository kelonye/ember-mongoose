var Batch = require('batch');

exports.any = function(req, done) {
  done();
};

exports.user = function(req, done) {
  if (!req.isAuthenticated()) {
    return done(403);
  }
  if (!req.user) {
    return done(403);
  }
  done();
};

exports.user_is_super = function(req, done) {
  var user = req.user;

  var batch = new Batch();
  batch.concurrency(1);

  batch.push(function(fn){
    exports.user(req, fn);
  });

  batch.push(function(fn){
    if (!user.is_super_user) {
      return fn(403);
    }
    fn();
  });

  batch.end(done);

};

exports.belongs_to_user = function(req, done) {

  var that = this;

  var batch = new Batch();
  batch.concurrency(1);

  batch.push(function(fn){
    exports.user(req, fn);
  });

  batch.push(function(fn){
    if (that.user_id && that.user_id !== req.user.id) {
      return fn(403);
    }
    fn();
  });

  batch.end(done);

};


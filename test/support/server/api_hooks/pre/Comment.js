/**
  * Module dependencies.
  */
var ensure = require('../../auth/common');


exports.create = function(req, cb) {
  this.user_id = req.user._id;
  return ensure.belongs_to_user(req, cb);
};
exports.read = ensure.any;
exports.query = ensure.none;
exports.update = ensure.belongs_to_user;
exports.remove = ensure.belongs_to_user;

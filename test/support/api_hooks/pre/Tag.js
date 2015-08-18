/**
  * Module dependencies.
  */
var ensure = require('../../auth/common');


exports.create = ensure.belongs_to_user;
exports.read = ensure.any;
exports.update = ensure.belongs_to_user;
exports.remove = ensure.belongs_to_user;

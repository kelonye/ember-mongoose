/**
  * Module dependencies.
  */
var ensure = require('../../auth/common');


exports.create = ensure.user_is_super;
exports.read = ensure.any;
exports.update = ensure.user_is_super;
exports.remove = ensure.user_is_super;

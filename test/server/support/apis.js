/**
  * Module dependencies
  */

var embermongoose = require('../../../')
var models = require('./models');

/**
  * Apis
  */

var apis = new embermongoose.Apis(models);

apis.User.setPaths([
    'name'
  , 'is_super_user'
]);

apis.Tag.setPaths([
    'name'
  , 'post_id'
]);

apis.Comment.setPaths([
    'content'
  , 'post_id'
  , 'user_id'
]);

apis.Post.setPaths([
    'title'
  , 'content'
]);

module.exports = apis.getURIS();
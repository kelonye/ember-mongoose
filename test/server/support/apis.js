var embermongoose = require('../../../')
  , models = require('./models');

var apis = new embermongoose.Apis();

var api = new embermongoose.Api()
  .setModel(models.User)
  .setPaths(['name' , 'is_super_user', 'comment_ids']);
apis.set('User', api);

var api = new embermongoose.Api()
  .setModel(models.Tag)
  .setPaths(['name' , 'post_id']);
apis.set('Tag', api);

var api = new embermongoose.Api()
  .setModel(models.Comment)
  .setPaths(['content' , 'post_id', 'user_id']);
apis.set('Comment', api);

var api = new embermongoose.Api()
  .setModel(models.Post)
  .setPaths(['title' , 'content', 'comment_ids', 'tag_ids']);
apis.set('Post', api);

module.exports = apis.getURIS();
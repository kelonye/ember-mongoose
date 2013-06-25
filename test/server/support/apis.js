var embermongoose = require('../../../')
  , models = require('./models');

var apis = new embermongoose.Apis();
apis.setModels(models);


apis.User = new embermongoose.Api()
  .setModel(models.User)
  .setPaths(['name' , 'is_super_user', 'comment_ids']);

apis.Tag = new embermongoose.Api()
  .setModel(models.Tag)
  .setPaths(['name' , 'post_id']);

apis.Comment = new embermongoose.Api()
  .setModel(models.Comment)
  .setPaths(['content' , 'post_id', 'user_id']);

apis.Post = new embermongoose.Api()
  .setModel(models.Post)
  .setPaths(['title' , 'content', 'comment_ids', 'tag_ids']);

module.exports = apis.getURIS();
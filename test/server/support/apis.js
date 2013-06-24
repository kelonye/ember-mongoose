var embermongoose = require('../../../')
  , models = require('./models');

var apis = new embermongoose.Apis();
apis.setModels(models);

apis.Post = new embermongoose.Api()
  .setModel(models.Post)
  .setFields(['name' , 'content']);


apis.Tag = new embermongoose.Api()
  .setModel(models.Tag)
  .setFields(['name' , 'content']);


apis.Comment = new embermongoose.Api()
  .setModel(models.Comment)
  .setFields(['name' , 'content']);


apis.User = new embermongoose.Api()
  .setModel(models.User)
  .setFields(['name' , 'content']);

module.exports = apis.getURIS();
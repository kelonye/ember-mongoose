var mongoose = require('mongoose')
  , timestamps = require('mongoose-time')
  , ensure = require('./ensure');

if (!global.mongo) global.mongo = require('./mongo')

/**
  * User
  */

var schema = new mongoose.Schema(
  {
      _id: String,
      name: String,
      is_super_user: Boolean
  }, {
      versionKey: false
  }
);
schema.plugin(timestamps());
exports.User = mongo.model('User', schema);


/**
  * Tag
  */

var schema = new mongoose.Schema(
  {
      _id: String,
      name: String,
      post_id: String
  }, {
      versionKey: false
  }
);
schema.plugin(timestamps());
schema.methods.__isCreatable__ = ensure.user;
schema.methods.__isReadable__ = ensure.any;
schema.methods.__isUpdatable__ = ensure.user;
schema.methods.__isRemovable__ = ensure.user;
exports.Tag = mongo.model('Tag', schema);


/**
  * Comment
  */

schema = new mongoose.Schema(
  {
      _id: String,
      content: String,
      post_id: String,
      user_id: String
  }, {
      versionKey: false
  }
);
schema.plugin(timestamps());
schema.methods.__isCreatable__ = function(req, cb) {
  this.user_id = req.user._id;
  return ensure.user(req, cb);
};
schema.methods.__isReadable__ = ensure.any;
schema.methods.__isUpdatable__ = ensure.user;
schema.methods.__isRemovable__ = ensure.user;
exports.Comment = mongo.model('Comment', schema);


/**
  * Post
  */

schema = new mongoose.Schema(
  {
      _id: String,
      title: String,
      content: String
  }, {
      versionKey: false
  }
);
schema.plugin(timestamps());
schema.methods.__isCreatable__ = ensure.superuser;
schema.methods.__isReadable__ = ensure.any;
schema.methods.__isUpdatable__ = ensure.superuser;
schema.methods.__isRemovable__ = ensure.superuser;
exports.Post = mongo.model('Post', schema);

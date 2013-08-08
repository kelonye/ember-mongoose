var mongoose = require('mongoose');
var timestamps = require('mongoose-time');
var ensure = require('./ensure');

if (!global.mongo) global.mongo = require('./mongo');

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
schema.methods.__isCreatable__ = ensure.belongs_to_user;
schema.methods.__isReadable__ = ensure.any;
schema.methods.__isUpdatable__ = ensure.belongs_to_user;
schema.methods.__isRemovable__ = ensure.belongs_to_user;
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
  return ensure.belongs_to_user(req, cb);
};
schema.methods.__isReadable__ = ensure.any;
schema.methods.__isUpdatable__ = ensure.belongs_to_user;
schema.methods.__isRemovable__ = ensure.belongs_to_user;
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
schema.methods.__isCreatable__ = ensure.user_is_super;
schema.methods.__isReadable__ = ensure.any;
schema.methods.__isUpdatable__ = ensure.user_is_super;
schema.methods.__isRemovable__ = ensure.user_is_super;
exports.Post = mongo.model('Post', schema);

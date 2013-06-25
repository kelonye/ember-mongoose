var mongoose = require('mongoose')
  , timestamps = require('mongoose-time')
  , ensure = require('./ensure');

if (!global.mongo) global.mongo = require('./mongo')

/**
  * User
  */

var schema = new mongoose.Schema(
  {
      name: String,
      is_super_user: Boolean,
      comment_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        path: 'user_id' // User.comment_ids ⇆ Comment.user_id
      }]
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
      name: String,
      post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }
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
      content: String,
      post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      },
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
  }, {
      versionKey: false
  }
);
schema.plugin(timestamps());
schema.methods.__isCreatable__ = function(req, cb) {
  if (this.user_id == null) this.user_id = req.user.id
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
      title: String,
      content: String,
      comment_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        path: 'post_id'
      }],
      tag_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        path: 'post_id'
      }]
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

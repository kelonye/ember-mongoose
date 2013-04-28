mongoose = require 'mongoose'
ensure = require './ensure'

###
User
###
schema = new mongoose.Schema
  date:
    type: Date
    default: Date.now
  name: String
  comment_ids: Array
  is_super_user: Boolean
exports.User = mongo.model 'User', schema


###
Tag
###
schema = new mongoose.Schema
  date:
    type: Date
    default: Date.now
  name: String
  post_id: String
schema.methods.__isCreatable__ = ensure.user
schema.methods.__isReadable__ = ensure.any
schema.methods.__isUpdatable__ = ensure.user
schema.methods.__isRemovable__ = ensure.user
exports.Tag = mongo.model 'Tag', schema


###
Comment
###
schema = new mongoose.Schema
  date:
    type: Date
    default: Date.now
  content: String
  post_id: String
  user_id: String
schema.methods.__isCreatable__ = (req, cb)->
  @user_id ?= req.user.id
  ensure.user req, cb
schema.methods.__isReadable__ = ensure.any
schema.methods.__isUpdatable__ = ensure.user
schema.methods.__isRemovable__ = ensure.user
exports.Comment = mongo.model 'Comment', schema


###
Post
###
schema = new mongoose.Schema
  date:
    type: Date
    default: Date.now
  title: String
  content: String
  comment_ids: Array
  tag_ids: Array
schema.methods.__isCreatable__ = ensure.superuser
schema.methods.__isReadable__ = ensure.any
schema.methods.__isUpdatable__ = ensure.superuser
schema.methods.__isRemovable__ = ensure.superuser
exports.Post = mongo.model 'Post', schema

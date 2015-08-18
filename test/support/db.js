/**
 * Module dependencies.
 */
var Batch = require('batch');

var config = require('./config');
var models = config.models;
var User = models.User;
var Tag = models.Tag;
var Post = models.Post;
var Comment = models.Comment;


exports.setUp = function(fn) {

  var user2;
  var post2;

  var batch = new Batch;

  batch.concurrency(1);

  batch.push(function(done){
    global.user = new User({
      name: 'TJ',
      is_super_user: true
    });
    user.save(done);
  });

  batch.push(function(done){
    user2 = new User({
      name: 'TJ',
      is_super_user: true
    });
    user2.save(done);    
  });

  batch.push(function(done){
    global.post = new Post({
      title: 'a',
      content: 'a'
    });
    post.save(done);    
  });

  batch.push(function(done){
    post2 = new Post({
      title: 'b',
      content: 'b'
    });
    post2.save(done);    
  });

  batch.push(function(done){
    global.tag = new Tag({
      name: 'a',
      post_id: post.id,
    });
    tag.save(done);
  });

  batch.push(function(done){
    new Tag({
      name: 'b',
      post_id: post2.id,
    }).save(done);
  });

  batch.push(function(done){
    global.comment = new Comment({
      content: 'a',
      user_id: user.id,
      post_id: post.id,
    });
    comment.save(done);
  });

  batch.push(function(done){
    new Comment({
      content: 'b',
      user_id: user2.id,
      post_id: post2.id,
    }).save(done);
  });

  batch.end(fn);

};

exports.tearDown = function(fn) {

  var batch = new Batch;

  batch.push(function(done){
    Post.remove(done);
  });
  batch.push(function(done){
    Tag.remove(done);
  });
  batch.push(function(done){
    User.remove(done);
  });
  batch.push(function(done){
    Comment.remove(done);
  });

  batch.end(fn);

};

var Batch = require('batch');
var models = require('./models');
var User = models.User;
var Tag = models.Tag;
var Post = models.Post;
var Comment = models.Comment;

exports.setUp = function(fn) {

  var batch = new Batch;

  batch.push(function(done){
    global.user = new User({
      _id: '1',
      name: 'TJ',
      is_super_user: true
    });
    user.save(done);
  });

  batch.push(function(done){
    new User({
      _id: '2',
      name: 'TJ',
      is_super_user: true
    }).save(done);    
  });

  batch.push(function(done){
    global.post = new Post({
      _id: '1',
      title: 'a',
      content: 'a'
    });
    post.save(done);    
  });

  batch.push(function(done){
    new Post({
      _id: '2',
      title: 'b',
      content: 'b'
    }).save(done);    
  });

  batch.push(function(done){
    global.tag = new Tag({
      _id: '1', 
      name: 'a',
      post_id: '1'
    });
    tag.save(done);
  });

  batch.push(function(done){
    new Tag({
      _id: '2', 
      name: 'b',
      post_id: '2'
    }).save(done);
  });

  batch.push(function(done){
    global.comment = new Comment({
      _id: '1',
      content: 'a',
      user_id: '1',
      post_id: '1'
    });
    comment.save(done);
  });

  batch.push(function(done){
    new Comment({
      _id: '2',
      content: 'b',
      user_id: '2',
      post_id: '2'
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

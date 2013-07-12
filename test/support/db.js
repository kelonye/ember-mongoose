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

  // batch.push(function(done){
  //   user = new User({
  //     _id: '2',
  //     name: 'TJ',
  //     is_super_user: true
  //   });
  //   user.save(done);    
  // });

  batch.push(function(done){
    global.post = new Post({
      _id: '1',
      title: 'a',
      content: 'a'
    });
    post.save(done);    
  });

  // batch.push(function(done){
  //   post = new Post({
  //     _id: '2',
  //     title: 'a',
  //     content: 'a'
  //   });
  //   post.save(done);    
  // });

  batch.push(function(done){
    global.tag = new Tag({
      _id: '1', 
      name: 'a',
      post_id: '1'
    });
    tag.save(done);
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

  batch.end(fn);

};

exports.tearDown = function(done) {
  Post.find().remove().exec(function(err) {
    if (err) return done(err);
    Tag.find().remove().exec(function(err) {
      if (err) return done(err);
      Comment.find().remove().exec(function(err) {
        if (err) return done(err);
        User.find().remove().exec(done);
      });
    });
  });
};

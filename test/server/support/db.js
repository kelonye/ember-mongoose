var Batch = require('batch')
  , models = require('./models')
  , User = models.User
  , Tag = models.Tag
  , Post = models.Post
  , Comment = models.Comment;

exports.setUp = function(done) {
  global.user = new User({
    name: 'TJ',
    is_super_user: true
  });
  user.save(function(err, user) {
    if (err) throw err
    global.post = new Post({
      title: 'a',
      content: 'a'
    });
    post.save(function(err, post) {
      if (err) throw err
      global.tag = new Tag({
        name: 'a',
        post_id: post.id
      });
      tag.save(function(err, tag) {
        if (err) throw err
        global.comment = new Comment({
          content: 'a',
          user_id: user.id,
          post_id: post.id
        });
        comment.save(done);
      });
    });
  });
};

exports.tearDown = function(done) {
  Post.find().remove().exec(function(err) {
    if (err) throw err
    Tag.find().remove().exec(function(err) {
      if (err) throw err
      Comment.find().remove().exec(function(err) {
        if (err) throw err
        User.find().remove().exec(done);
      });
    });
  });
};

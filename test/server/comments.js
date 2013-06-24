var should = require('should')
  , request = require('supertest')
  , mongoose = require('mongoose')
  , app = require('./support/')
  , db = require('./support/db')
  , models = require('./support/models')
  , User = models.User
  , Tag = models.Tag
  , Post = models.Post
  , Comment = models.Comment;

describe('comments', function() {
  beforeEach(function(done) {
    db.setUp(done);
  });
  afterEach(function(done) {
    db.tearDown(done);
  });
  describe('GET /', function() {
    it('should a list of comments on query', function(done) {
      request(app)
        .get('/comments')
        .expect(200).end(function(err, res) {
          if (err) done(err)
          res.body.comments.length.should.equal(1);
          done();
        });
    });
  });
  describe('POST /', function() {
    it('should create and a comment', function(done) {
      request(app)
        .post('/comments').send({ comment: {
          content: 'b',
          post_id: post.id
        }})
        .expect(200).end(function(err, res) {
          if (err) done(err)
          res.body.comment.content.should.equal('b');
          res.body.comment.post_id.should.equal(post.id);
          res.body.comment.user_id.should.equal(user.id);
          Post.findById(post.id, function(err, post) {
            if (err) done(err)
            post.comment_ids.should.include(comment.id);
            done();
          });
        });
    });
  });
  describe('GET /:id', function() {
    it('should a comment', function(done) {
      request(app)
        .get('/comments/' + comment.id)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err)
          res.body.comment._id.should.equal(comment.id);
          res.body.comment.content.should.equal('a');
          res.body.comment.post_id.should.equal(post.id);
          done();
        });
    });
  });
  describe('PUT /:id', function() {
    it('should update and comment', function(done) {
      request(app)
        .put('/comments/' + comment.id)
        .send({ comment: {
          content: 'b'
        }})
        .expect(200)
        .end(function(err, res) {
          res.body.comment.content.should.equal('b');
          if (err) done(err)
          Comment.findById(comment.id, function(err, comment) {
            if (err) done(err)
            comment.content.should.equal('b');
            done();
          });
        });
    });
  });
  describe('POST:QUERY /', function() {
    it('should matched items', function(done) {
      request(app)
        .post('/comments')
        .send({ q: {
          content: 'a'
        }})
        .expect(200)
        .end(function(err, res) {
          if (err) done(err)
          res.body.comments.length.should.equal(1);
          done();
        });
    });
  });
  describe('DELETE /:id', function() {
    it('should remove a comment', function(done) {
      request(app)
        .del('/comments/' + comment.id)
        .expect(200)
        .expect({})
        .end(function(err, res) {
          if (err) done(err)
          Comment.findById(comment.id, function(err, _comment) {
            if (err) done(err)
            should.not.exist(_comment);
            Post.findById(post.id, function(err, post) {
              if (err) done(err)
              post.comment_ids.should.not.include(comment.id);
              done();
            });
          });
        });
    });
  });
});

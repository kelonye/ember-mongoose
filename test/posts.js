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

describe('posts', function() {
  beforeEach(function(done) {
    db.setUp(done);
  });
  afterEach(function(done) {
    db.tearDown(done);
  });
  describe('GET /', function() {
    it('should return a list of posts', function(done) {
      request(app)
        .get('/posts')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.posts.length.should.equal(1);
          done();
      });
    });
  });
  describe('POST /', function() {
    it('should create and return a post', function(done) {
      request(app)
        .post('/posts').send({ post: {
            title: 'b',
            content: 'b'
        }})
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.post.title.should.equal('b');
          res.body.post.content.should.equal('b');
          done();
        });
    });
  });
  describe('QUERY /', function() {
    it('should return matched posts', function(done) {
      request(app)
        .post('/posts').send(
          {
            query: {
                conditions:{
                  title: 'a'
                }
            }
          }
        )
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.posts.length.should.equal(1);
          done();
        });
    });
  });
  describe('GET /:id', function() {
    it('should return a post', function(done) {
      request(app)
        .get('/posts/' + post.id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.post._id.should.equal(post.id);
          res.body.post.title.should.equal('a');
          res.body.post.content.should.equal('a');
          done();
        });
    });
  });
  describe('PUT /:id', function() {
    it('should update and return a post', function(done) {
      request(app)
        .put('/posts/' + post.id).send({ post: {
          title: 'b',
          content: 'b'
        }})
        .expect(200)
        .end(function(err, res) {
          res.body.post.title.should.equal('b');
          res.body.post.content.should.equal('b');
          if (err) return done(err);
          Post.findById(post.id, function(err, post) {
            if (err) return done(err);
            post.title.should.equal('b');
            post.content.should.equal('b');
            done();
          });
        });
    });
  });
  describe('DELETE /:id', function() {
    it('should remove a post', function(done) {
      request(app)
        .del('/posts/' + post.id)
        .expect(200)
        .expect({})
        .end(function(err, res) {
          if (err) return done(err);
          Post.findById(post.id, function(err, post) {
            if (err) return done(err);
            should.not.exist(post);
            Tag.findById(tag.id, function(err, tag) {
              if (err) return done(err);
              should.not.exist(tag);
              Comment.findById(comment.id, function(err, comment) {
                if (err) return done(err);;
                should.not.exist(comment);
                done();
              });
            });
          });
      });
    });
  });
});

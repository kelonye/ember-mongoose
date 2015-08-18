/**
 * Module dependencies.
 */
var Batch = require('batch');
var should = require('should');
var request = require('supertest');
var mongoose = require('mongoose');

var config = require('./support/config');
var models = config.models;
var User = models.User;
var Tag = models.Tag;
var Post = models.Post;
var Comment = models.Comment;

var app = require('./support/');
var db = require('./support/db');


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
          res.body.posts.length.should.equal(2);
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
                conditions: {
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
  describe('COUNT /', function() {
    it('should return no of posts', function(done) {
      
      var batch = new Batch;

      batch.push(function(cb){
        request(app)
          .post('/posts').send(
            {
              query: {
                conditions: {
                },
                options: {
                  count: true
                }
              },
            }
          )
          .expect(200)
          .end(function(err, res) {
            if (err) return cb(err);
            res.body.meta.total.should.equal(2);
            cb();
          });
      });

      batch.push(function(cb){
        request(app)
          .post('/posts').send(
            {
              query: {
                conditions: {
                  title: 'a'
                },
                options: {
                  count: true
                }
              },
            }
          )
          .expect(200)
          .end(function(err, res) {
            if (err) return cb(err);
            res.body.meta.total.should.equal(1);
            cb();
          });
      });

      batch.end(done);

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
    it('should return a custom field in payload', function(done) {
      request(app)
        .get('/posts/' + post.id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.post.no_of_tags.should.equal('NO_OF_TAGS');
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
          done();
          // should remove orphan entities yourself
          // Post.findById(post.id, function(err, post) {
          //   if (err) return done(err);
          //   should.not.exist(post);
          //   Tag.findById(tag.id, function(err, tag) {
          //     if (err) return done(err);
          //     should.not.exist(tag);
          //     Comment.findById(comment.id, function(err, comment) {
          //       if (err) return done(err);;
          //       should.not.exist(comment);
          //       done();
          //     });
          //   });
          // });
      });
    });
  });
});

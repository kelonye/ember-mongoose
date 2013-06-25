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

describe('tags', function() {
  beforeEach(function(done) {
    db.setUp(done);
  });
  afterEach(function(done) {
    db.tearDown(done);
  });
  describe('GET /', function() {
    it('should return a list of tags', function(done) {
      request(app)
        .get('/tags')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err
          res.body.tags.length.should.equal(1);
          done();
        });
    });
  });
  describe('POST /', function() {
    it('should create and return a tag', function(done) {
      request(app)
        .post('/tags')
        .send({ tag: {
          name: 'b',
          post_id: post.id
        }})
        .expect(200)
        .end(function(err, res) {
          if (err) throw err
          res.body.tag.name.should.equal('b');
          res.body.tag.post_id.should.equal(post.id);
          Post.findById(post.id, function(err, post) {
            if (err) throw err
            post.tag_ids.should.include(tag.id);
            done();
          });
        });
    });
  });
  describe('QUERY /', function() {
    it('should return matched tags', function(done) {
      request(app)
        .post('/tags')
        .send({ q: {
          _id: {
            $in: [tag.id, tag.id]
          }
        }})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.body.tags.length.should.equal(1);
          done();
        });
    });
  });
  describe('GET /:id', function() {
    it('should return a tag', function(done) {
      request(app)
        .get('/tags/' + tag.id)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err
          res.body.tag._id.should.equal(tag.id);
          res.body.tag.name.should.equal('a');
          res.body.tag.post_id.should.equal(post.id);
          done();
        });
    });
  });
  describe('PUT /:id', function() {
    it('should update and return a tag', function(done) {
      request(app)
        .put('/tags/' + tag.id).send({ tag: {
          name: 'b'
        }})
        .expect(200)
        .end(function(err, res) {
          res.body.tag.name.should.equal('b');
          if (err) throw err
          Tag.findById(tag.id, function(err, tag) {
            if (err) throw err
            tag.name.should.equal('b');
            done();
          });
        });
    });
  });
  describe('DELETE /:id', function() {
    it('should remove a tag', function(done) {
      request(app)
        .del('/tags/' + tag.id)
        .expect(200)
        .expect({})
        .end(function(err, res) {
          if (err) throw err
          Tag.findById(tag.id, function(err, _tag) {
            if (err) throw err
            should.not.exist(_tag);
            Post.findById(post.id, function(err, post) {
              if (err) throw err
              post.tag_ids.should.not.include(tag.id);
              done();
            });
          });
        });
    });
  });
});
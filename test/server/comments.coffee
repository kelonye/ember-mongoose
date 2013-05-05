l = console.log

should = require 'should'
request = require 'supertest'
mongoose = require 'mongoose'

app = require './support/'
db = require './support/db'
models = require './support/models'

User= models.User
Tag = models.Tag
Post = models.Post
Comment = models.Comment

describe 'comments', ->

  beforeEach (done)->
    db.setUp done
  afterEach (done)->
    db.tearDown done

  describe 'GET /', ->
    it 'should return a list of comments on query', (done)->
      request(app)
        .get("/comments?post_id=1")
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.comments.length.should.equal 0
          
          request(app)
            .get("/comments?post_id=#{post.id}")
            .expect(200)
            .end (err, res) ->
              return throw err if err
              res.body.comments.length.should.equal 1
              done()

  describe 'POST /', ->
    it 'should create and return a comment', (done)->
      request(app)
        .post('/comments')
        .send(
          comment:
            content: 'b'
            post_id: post.id
        )
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.comment.content.should.equal 'b'
          res.body.comment.post_id.should.equal post.id
          res.body.comment.user_id.should.equal user.id
          # associated post's comments should include comment's id
          Post.findById post.id, (err, post) ->
            return throw err if err
            post.comment_ids.should.include comment.id
            done()

  describe 'GET /:id', ->
    it 'should return a comment', (done)->
      request(app)
        .get("/comments/#{comment.id}")
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.comment._id.should.equal comment.id
          res.body.comment.content.should.equal 'a'
          res.body.comment.post_id.should.equal post.id
          done()

  describe 'PUT /:id', ->
    it 'should update and return comment', (done)->
      request(app)
        .put("/comments/#{comment.id}")
        .send(
          comment:
            content: 'b'
        )
        .expect(200)
        .end (err, res) ->
          res.body.comment.content.should.equal 'b'
          return throw err if err
          Comment.findById comment.id, (err, comment) ->
            return throw err if err
            comment.content.should.equal 'b'
            done()

  describe 'POST:QUERY /', ->
    it 'should return matched items', (done)->
      request(app)
        .post('/comments')
        .send(
          q:
            content: 'a'
        )
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.comments.length.should.equal 1
          done()

  describe 'DELETE /:id', ->
    it 'should remove a comment', (done)->
      request(app)
        .del("/comments/#{comment.id}")
        .expect(200)
        .expect({})
        .end (err, res) ->
          return throw err if err
          Comment.findById comment.id, (err, _comment) ->
            return throw err if err
            should.not.exist _comment
            # comment's id should be removed from associated post's comments array
            Post.findById post.id, (err, post) ->
              return throw err if err
              post.comment_ids.should.not.include comment.id
              done()

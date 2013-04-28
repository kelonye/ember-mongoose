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

describe 'posts', ->

  beforeEach (done)->
    db.setUp done
  afterEach (done)->
    db.tearDown done

  describe 'GET /', ->
    it 'should return a list of posts', (done)->
      request(app)
        .get('/posts')
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.posts.length.should.equal 1
          done()


  describe 'POST /', ->
    it 'should create and return a post', (done)->
      request(app)
        .post('/posts')
        .send(
          post:
            title: 'b'
            content: 'b'
        )
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.post.title.should.equal 'b'
          res.body.post.content.should.equal 'b'
          done()


  describe 'POST:QUERY /', ->
    it 'should return matched items', (done)->
      request(app)
        .post('/posts')
        .send(
          q:
            title: 'a'
        )
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.posts.length.should.equal 1
          done()

  describe 'GET /:id', ->
    it 'should return a post', (done)->
      request(app)
        .get("/posts/#{post._id}")
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.post._id.should.equal post._id.toString()
          res.body.post.title.should.equal 'a'
          res.body.post.content.should.equal 'a'
          res.body.post.tag_ids[0].should.equal tag._id.toString()
          res.body.post.comment_ids[0].should.equal comment._id.toString()
          done()

  describe 'PUT /:id', ->
    it 'should update and return a post', (done)->
      request(app)
        .put("/posts/#{post._id}")
        .send(
          post:
            title: 'b'
            content: 'b'
        )
        .expect(200)
        .end (err, res) ->
          res.body.post.title.should.equal 'b'
          res.body.post.content.should.equal 'b'
          return throw err if err
          Post.findById post._id, (err, post) ->
            return throw err if err
            post.title.should.equal 'b'
            post.content.should.equal 'b'
            done()

  describe 'DELETE /:id', ->
    it 'should remove a post', (done)->
      request(app)
        .del("/posts/#{post._id}")
        .expect(200)
        .expect({})
        .end (err, res) ->
          return throw err if err

          Tag.findById tag._id, (err, tag) ->
            return throw err if err
            should.not.exist tag
            Post.findById post._id, (err, post) ->
              return throw err if err
              should.not.exist post
              Comment.findById comment._id, (err, comment) ->
                return throw err if err
                should.not.exist comment
                done()

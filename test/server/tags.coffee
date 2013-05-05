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

describe 'tags', ->

  beforeEach (done)->
    db.setUp done
  afterEach (done)->
    db.tearDown done

  describe 'GET /', ->
    it 'should return a list of tags on query', (done)->
      request(app)
        .get("/tags?post_id=1")
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.tags.length.should.equal 0
          
          request(app)
            .get("/tags?post_id=#{post.id}")
            .expect(200)
            .end (err, res) ->
              return throw err if err
              res.body.tags.length.should.equal 1
              done()


  describe 'POST /', ->
    it 'should create and return a tag', (done)->
      request(app)
        .post('/tags')
        .send(
          tag:
            name: 'b'
            post_id: post.id
        )
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.tag.name.should.equal 'b'
          res.body.tag.post_id.should.equal post.id
          # associated post's tags should include tag's id
          Post.findById post.id, (err, post) ->
            return throw err if err
            post.tag_ids.should.include tag.id
            done()


  describe 'POST:QUERY /', ->
    it 'should return matched items', (done)->
      request(app)
        .post('/tags')
        .send(
          q:
            _id:
              $in: [tag.id, tag.id]
        )
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.tags.length.should.equal 1
          done()

  describe 'GET /:id', ->
    it 'should return a tag', (done)->
      request(app)
        .get("/tags/#{tag.id}")
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.tag._id.should.equal tag.id
          res.body.tag.name.should.equal 'a'
          res.body.tag.post_id.should.equal post.id
          done()

  describe 'PUT /:id', ->
    it 'should update and return tag', (done)->
      request(app)
        .put("/tags/#{tag.id}")
        .send(
          tag:
            name: 'b'
        )
        .expect(200)
        .end (err, res) ->
          res.body.tag.name.should.equal 'b'
          return throw err if err
          Tag.findById tag.id, (err, tag) ->
            return throw err if err
            tag.name.should.equal 'b'
            done()

  describe 'DELETE /:id', ->
    it 'should remove a tag', (done)->
      request(app)
        .del("/tags/#{tag.id}")
        .expect(200)
        .expect({})
        .end (err, res) ->
          return throw err if err
          Tag.findById tag.id, (err, _tag) ->
            return throw err if err
            should.not.exist _tag
            # tag's id should be removed from associated post's tags array
            Post.findById post.id, (err, post) ->
              return throw err if err
              post.tag_ids.should.not.include tag.id
              done()

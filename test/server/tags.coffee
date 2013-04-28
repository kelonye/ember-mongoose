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
            .get("/tags?post_id=#{post._id}")
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
            post_id: post._id
        )
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.tag.name.should.equal 'b'
          res.body.tag.post_id.should.equal post._id.toString()
          # associated post's tags should include tag's id
          Post.findById post._id, (err, post) ->
            return throw err if err
            post.tag_ids.should.include tag._id.toString()
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
        .get("/tags/#{tag._id}")
        .expect(200)
        .end (err, res) ->
          return throw err if err
          res.body.tag._id.should.equal tag._id.toString()
          res.body.tag.name.should.equal 'a'
          res.body.tag.post_id.should.equal post._id.toString()
          done()

  describe 'PUT /:id', ->
    it 'should update and return tag', (done)->
      request(app)
        .put("/tags/#{tag._id}")
        .send(
          tag:
            name: 'b'
        )
        .expect(200)
        .end (err, res) ->
          res.body.tag.name.should.equal 'b'
          return throw err if err
          Tag.findById tag._id, (err, tag) ->
            return throw err if err
            tag.name.should.equal 'b'
            done()

  describe 'DELETE /:id', ->
    it 'should remove a tag', (done)->
      request(app)
        .del("/tags/#{tag._id}")
        .expect(200)
        .expect({})
        .end (err, res) ->
          return throw err if err
          Tag.findById tag._id, (err, _tag) ->
            return throw err if err
            should.not.exist _tag
            # tag's id should be removed from associated post's tags array
            Post.findById post._id, (err, post) ->
              return throw err if err
              post.tag_ids.should.not.include tag._id.toString()
              done()

var should = require('should');
var express = require('express');
var request = require('supertest');
var embermongoose = require('../../');

describe('apis', function() {
  describe('use', function() {
    it('should apply fn plugin', function(done) {
      var app = express();
      var apis = embermongoose({});
      apis.use('/yeha', function(req, res){
        res.send('yeha');
      });
      app.use(apis.getURIS());
      request(app)
        .get('/yeha')
        .expect(200)
        .expect('yeha', done);
    });
    it('should apply (path, fn) plugin', function(done) {
      var app = express();
      var apis = embermongoose({});
      apis.use('/', function(req, res){
        res.send('yeha');
      });
      app.use(apis.getURIS());
      request(app)
        .get('/')
        .expect(200)
        .expect('yeha', done);
    });
  });
});

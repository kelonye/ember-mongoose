/**
  * Module dependencies.
  */
var Batch = require('batch');
var mongoose = require('mongoose');
var clone = require('component-clone');
var camelize = require('camelcase');
var decamelize = require('decamelize');
var pluralize = require('pluralize');


/**
  * Expose `Api`.
  */

module.exports = Api;


/**
  * Api
  */
function Api (apis, modelName) {
  this.apis = apis;
  this.modelName = modelName;
}


/**
  * Set `model`.
  */
Api.prototype.setModel = function() {
  this.model = this.apis._models[this.modelName];
  return this;
};


/**
  * Set singular name
  */
Api.prototype.setSingularName = function() {
  this.singularName = camelize(this.model.modelName);
  return this;
};


/**
  * Set plural name
  */
Api.prototype.setPluralName = function() {
  this.pluralName = pluralize(this.singularName);
  this.resourceName = pluralize(decamelize(this.model.modelName, '-'));
  // console.log(this.singularName, this.resourceName, this.pluralName);
  return this;
};


/**
  * Set request hooks
  */
Api.prototype.setHooks = function() {
  var hooks = this.apis._hooks;
  this.hooks = {
    pre: defaultHooks(
      hooks.pre[this.modelName],
      function(req, done){
        done();
      }
    ),
    post: defaultHooks(
      hooks.post[this.modelName],
      function(req, payload, done){
        done(null, payload);
      }
    ),
  }
  return this;
};


/**
  * Validate model fields.
  */
Api.prototype.setPaths = function() {
  var self = this;
  var paths = this.apis._fields[this.modelName];
  var _paths = this.model.schema.paths;
  // validate paths
  paths.forEach(function(path){
    if (!_paths[path]){
      var e = self.model.modelName + ' has no path named ' + path;
      throw new Error(e);
    }
  });
  this.pathsString = paths.join(' ');
  this.paths = paths;
  return this;
};


/**
  * Filter paths on json
  */
Api.prototype.filterJSON = function(json) {
  var obj = {};
  obj._id = json._id;
  this.paths.forEach(function(path){
    // Ember.String.decamelize
    // var STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
    // var key = path
    //   .replace(STRING_DECAMELIZE_REGEXP, '$1_$2')
    //   .toLowerCase();
    //
    // obj[key] = json[path];
    obj[path] = json[path];
  });
  return obj;
};


/**
  * Register resource routes on `app`
  *
  * @param {Application} app - Express app instance
  */
Api.prototype.mount = function(app) {
  this
    .setModel()
    .setSingularName()
    .setPluralName()
    .setPaths()
    .setHooks();
  app.get('/' + this.resourceName, this.all.bind(this));
  app.post('/' + this.resourceName, this.create.bind(this));
  app.get('/' + this.resourceName + '/:id', this.one.bind(this));
  app.put('/' + this.resourceName + '/:id', this.update.bind(this));
  app.delete('/' + this.resourceName + '/:id', this.remove.bind(this));
};


/**
  * GET /`model`/
  */
Api.prototype.all = function(req, res, next) {

  var self = this;
  var conditions;
  var fields;
  var items;
  var pages;
  var skip;
  var limit;
  var count;
  var page;
  var query = req.query.query;
  var response = {};
  var records = [];

  if (query){
    try{
      query = JSON.parse(query);
    } catch (err){
      return next(new Error('could not parse req.query.query '+ err.message));
    }

    conditions = query.conditions;
    if (query.options){
      skip = query.options.skip;
      limit = query.options.limit;
      var count = !!query.options.count;
      if (count) {
        page = query.options.page;
        delete query.options.count;
        delete query.options.page;
      }
    }
  } else {
    query = {};
  }

  var batch = new Batch;

  batch.concurrency(1);

  batch.push(self.hooks.pre.query.bind(null, req));

  batch.push(function(done){

    var options = clone(query.options);
    self
      .model
      .find(conditions, fields, options)
      .exec(function(err, data) {
        items = data;
        done(err);
      });

  });

  batch.push(function(done){

    var batch = new Batch;

    batch.concurrency(5);

    items.forEach(function(item) {
      batch.push(function(fn){
        self.hooks.pre.read.call(item, req, function(err) {
          if (err) return fn(); // skip

          var payload = {};
          payload[self.singularName] = self.filterJSON(item);
          self.hooks.post.read.call(item, req, payload, function(err, payload) {
            if (err) return fn(); // skip

            records.push(payload[self.singularName]);
            fn();
          });
        });
      });
    });

    batch.end(done);

  });

  batch.push(function(done){

    if (count){

      // if you need to do pagination,
      // call the count request first before proceeeding to retrieve the pages
      var total = records.length;
      var pages = Math.ceil(total/(page || 1));

      response.meta = {
        pages: pages,
        total: total
      };

      response[self.pluralName] = [];

    } else {

      response[self.pluralName] = records;

    }

    done();

  });

  batch.push(function(done){
    self.hooks.post.query.call(null, req, response, function(err, data){
      response = data;
      done(err);
    });
  });

  batch.end(function(err){
    if (err) return next(err);
    res.json(response);
  });

};


/**
  * POST /`model`/
  */
Api.prototype.create = function(req, res, next) {
  var self = this;
  var item = new self.model({});
  self.hooks.pre.create.call(item, req, function(err) {
    if (err) return next(err);
    var data = req.body[self.singularName];
    for (var k in data){
      item[k] = data[k];
    }
    item.save(function(err, item) {
      if (err) return next(err);

      var payload = {};
      payload[self.singularName] = self.filterJSON(item);
      self.hooks.post.create.call(item, req, payload, function(err, payload){
        if (err) return next(err);
        res.json(payload);
      });

    });
  });
};


/**
  * GET /`model`/`id`/
  */
Api.prototype.one = function(req, res, next) {
  var self = this;
  self.model.findById(req.params.id, function(err, item) {
    if (err) return next(err);
    if (!item){
      var err = new Error('404');
      err.status = 404;
      return next(err);
    }
    self.hooks.pre.read.call(item, req, function(err) {
      if (err) return next(err);

      var payload = {};
      payload[self.singularName] = self.filterJSON(item);
      self.hooks.post.read.call(item, req, payload, function(err, payload){
        if (err) return next(err);
        res.json(payload);
      });

    });
  });
};


/**
  * PUT /`model`/`id`/
  */
Api.prototype.update = function(req, res, next) {
  var self = this;
  self.model.findById(req.params.id, function(err, item) {
    if (err) return next(err);
    if (!item){
      var err = new Error('404');
      err.status = 404;
      return next(err);
    }
    self.hooks.pre.update.call(item, req, function(err) {
      if (err) return next(err);

      var data = req.body[self.singularName];
      for (var k in data){
        item[k] = data[k];
      }

      item.save(function(err, item) {
        if (err) return next(err);

        var payload = {};
        payload[self.singularName] = self.filterJSON(item);
        self.hooks.post.update.call(item, req, payload, function(err, payload){
          if (err) return next(err);
          res.json(payload);
        });

      });

    });
  });
};


/**
  * DELETE /`model`/`id`/
  */
Api.prototype.remove = function(req, res, next) {
  var self = this;
  self.model.findById(req.params.id, function(err, item) {
    if (err) return next(err);
    if (!item){
      var err = new Error('404');
      err.status = 404;
      return next(err);
    }
    self.hooks.pre.remove.call(item, req, function(err) {
      if (err) return next(err);
      item.remove(function(err) {
        if (err) return next(err);

        var payload = {};
        // payload[self.singularName] = self.filterJSON(item);
        self.hooks.post.remove.call(item, req, payload, function(err, payload){
          if (err) return next(err);
          res.json(payload);
        });

      });
    });
  });
};


function defaultHooks(hooks, defaultCallback){
  hooks = hooks || {};
  ['read', 'query', 'create', 'update', 'remove'].forEach(function(k){
    hooks[k] = hooks[k] || defaultCallback;
  });
  return hooks;
};

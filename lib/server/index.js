/**
  * Module dependencies
  */

var Batch = require('batch');
var express = require('express');
var mongoose = require('mongoose');


/**
  * Expose `Api`
  */

exports.Api = Api;


/**
  * Api
  */

function Api () {
  return this;
};


/**
  * Set `model`
  */

Api.prototype.setModel = function(model) {
  this.model = model;
  return this;
};


/**
  * Set `paths` to output to json
  */

Api.prototype.setPaths = function(paths) {
  var that = this
    , _paths = this.model.schema.paths;
  // validate paths
  paths.forEach(function(path){
    if (!_paths[path]){
      throw that.model.modelName + ' has no path named ' + path;
    }
  })
  this.paths = paths;
  return this;
};


/**
  * Set `apis` obj
  */

Api.prototype.setApis = function(apis) {
  this.apis = apis;
  return this;
};


/**
  * Get URIS
  */

Api.prototype.getURIS = function() {
  this
    .setSingularName()
    .setPluralName()
    .setBelongsToName()
    .setRemoveHook();

  var app = express();
  app.get('/' + this.pluralName, this.all.bind(this));
  app.post('/' + this.pluralName, this.create.bind(this));
  app.get('/' + this.pluralName + '/:id', this.one.bind(this));
  app.put('/' + this.pluralName + '/:id', this.update.bind(this));
  app.del('/' + this.pluralName + '/:id', this.remove.bind(this));
  return app;
};


/**
  * Set singular name
  */

Api.prototype.setSingularName = function() {
  this.singularName = this.model.modelName.toLowerCase();
  return this;
};


/**
  * Set plural name
  */

Api.prototype.setPluralName = function() {
  this.pluralName = this.model.collection.name;
  return this;
};


/**
  * Set belongsto name
  */

Api.prototype.setBelongsToName = function() {
  this.belongsToName = this.singularName + '_id';
  return this;
};


/**
  * Destroy children
  */

Api.prototype.setRemoveHook = function() {

  var that = this;

  this.model.schema.pre('remove', function(next) {

    var item = this;
    var batch = new Batch;

    Object.keys(that.apis.models).forEach(function(i){
      var model = that.apis.models[i];
      batch.push(function(fn) {
        var query = {};
        query[that.belongsToName] = item.id;
        model.find(query).remove().exec(fn);
      });
    });

    batch.end(function(err){
      if (err) throw err;
      next();
    });

  });

  return this;

};


/**
  * Filter paths on json
  */

Api.prototype.filterJSON = function(json) {
  var obj = {};
  obj._id = json._id;
  this.paths.forEach(function(path){
    obj[path] = json[path];
  });
  return obj;
};


/**
  * GET /`model`/
  */

Api.prototype.all = function(req, res) {
  var that = this;
  that.model.find(req.query, function(err, items) {
    if (err) return res.send(err)
    if (!items) items = []
    var batch = new Batch;
    items.forEach(function(item) {
      item.__isReadable__(req, function(err, can) {
        if (err) return res.send(err)
        if (can === true) {
          batch.push(function(fn){
            return fn(null, that.filterJSON(item));
          });
        }
      });
    });
    batch.end(function(err, items){
      if (err && err != false) return res.send(err)
      var json = {};
      json[that.pluralName] = items;
      return res.send(json);
    });
  });
};


/**
  * POST /`model`/
  */

Api.prototype.create = function(req, res) {
  if (req.body.q) {
    req.query = req.body.q;
    return this.all(req, res);
  }
  var that = this
    , item = new that.model(req.body[that.singularName]);
  item.__isCreatable__(req, function(err, can) {
    if (err) return res.send(err);
    if (can !== true) return res.send(can);
    item.save(function(err, item) {
      if (err) return res.send(err);
      var json = {};
      json[that.singularName] = that.filterJSON(item);
      return res.send(json);
    });
  });
};


/**
  * GET /`model`/`id`/
  */

Api.prototype.one = function(req, res) {
  var that = this;
  that.model.findById(req.params.id, function(err, item) {
    if (err) return res.send(err)
    if (!item) return res.send(404)
    item.__isReadable__(req, function(err, can) {
      if (err) return res.send(err)
      if (can !== true) return res.send(can)
      var json = {};
      json[that.singularName] = that.filterJSON(item);
      return res.send(json);
    });
  });
};


/**
  * PUT /`model`/`id`/
  */

Api.prototype.update = function(req, res) {
  var that = this;
  that.model.findById(req.params.id, function(err, item) {
    if (err) return res.send(err)
    if (!item) return res.send(404)
    item.__isUpdatable__(req, function(err, can) {
      if (err) return res.send(err)
      if (can !== true) return res.send(can)
      item.update(req.body[that.singularName], function(err) {
        if (err) return res.send(err)
        that.model.findById(req.params.id, function(err, item) {
          if (err) return res.send(err)
          item.save(function(err, item) {
            if (err) return res.send(err)
            var json = {};
            json[that.singularName] = that.filterJSON(item);
            return res.send(json);
          });
        });
      });
    });
  });
};


/**
  * DELETE /`model`/`id`/
  */

Api.prototype.remove = function(req, res) {
  var that = this;
  that.model.findById(req.params.id, function(err, item) {
    if (err) return res.send(err)
    if (!item) return res.send(404)
    item.__isRemovable__(req, function(err, can) {
      if (err) return res.send(err)
      if (can !== true) return res.send(can)
      item.remove(function(err) {
        if (err) return res.send(err)
        return res.send({});
      });
    });
  });
};



/**
  * Expose `Apis`
  */

exports.Apis = Apis;


/**
  * Apis
  */

function Apis (models) {
  var that = this;
  this.models = models;
  Object.keys(models).forEach(function(modelName){
    var model = models[modelName];
    var api = new Api;
    api.setModel(model);
    api.setApis(that);
    that[modelName] = api;
  });
  return this;
};


/**
  * Get URIS
  */
Apis.prototype.getURIS = function() {
  var that = this
    , app = express();
  Object.keys(that).forEach(function(name){
    if (name == 'models') return;
    app.use(that[name].getURIS());
  });
  return app;
};

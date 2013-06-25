/**
  * Module dependencies
  */

var Batch = require('batch')
  , express = require('express')
  , mongoose = require('mongoose');


/**
  * Expose `Path`
  */

exports.Path = Path;

/**
  * Model path
  */

function Path () {
  return this;
}


/**
  * Set `path`
  */

Path.prototype.setPath = function(path) {
  this.path = path;
  return this;
};


/**
  * Set `api`
  */

Path.prototype.setApi = function(api) {
  this.api = api;
  return this;
};


/**
  * Set `apis` obj
  */

Path.prototype.setApis = function(apis) {
  this.apis = apis;
  this.models = apis.models;
  return this;
};


/**
  * Gen path type
  */

Path.prototype.setType = function() {
  if (this.path.options.ref){
    this.type = 'belongsto';
  } else if (this.path.options.type instanceof Array){
    this.type = 'hasmany';
  }
  return this;
};


/**
  * Gen path option
  */

Path.prototype.setOption = function() {
  if (this.path.options.ref){
    this.option = this.path.options;
  } else {
    this.option = this.path.options.type[0];
  }
  return this;
};


/**
  * Gen path model
  */

Path.prototype.setModel = function() {
  this.model = this.models[this.option.ref];
  return this;
};


/**
  * Gen path name
  */

Path.prototype.setName = function() {
  this.name = this.path.path;
  if (this.type == 'belongsto'){
    this.hasManyName = this.api.model.modelName.toLowerCase() + '_ids';
  } else {
    this.belongsToName = this.api.model.modelName.toLowerCase() + '_id';
  }
  return this;
};


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
    .setPathRelations()
    .setModelPreHooks()
    .setModelPostHooks();

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
  * Search belongs-to relations from `apis` obj
  */

Api.prototype.setPathRelations = function() {
  var that = this
    , paths = this.model.schema.paths;
  this.belongsToPaths = [];
  this.hasManyPaths = [];
  Object.keys(paths).forEach(function(i){
    var path = new Path;
    path
      .setPath(paths[i])
      .setApi(that)
      .setApis(that.apis)
      .setType()
    if (!path.type){
      return
    } else if (path.type == 'belongsto'){
      that.belongsToPaths.push(path);
    } else {
      that.hasManyPaths.push(path);
    }
    path
      .setOption()
      .setModel()
      .setName()
  });
  return this;
};


/**
  * Remove an api item's id from a destroying child's api_ids
  * Destroy an api item when a parent is being destroyed
  */

Api.prototype.setModelPreHooks = function() {
  var that = this;
  this.model.schema.pre('remove', function(next) {
    if (that.belongsToPaths.length === that.hasManyPaths.length === 0) return next()
    var item = this
      , batch = new Batch;
    that.belongsToPaths.forEach(function(path){
      var id = item[path.name];
      if (!id) return
      batch.push(function(fn) {
        path.model.findById(id, function(err, pathModelItem) {
          if (err) return fn(err)
          pathModelItem[path.hasManyName].remove(item._id);
          pathModelItem.save(fn);
        });
      });
    });
    batch.end(function(err){
      if (err) return next(err)
      batch = new Batch;
      that.hasManyPaths.forEach(function(path){
        batch.push(function(fn) {
          var query = {};
          query[path.belongsToName] = item._id;
          return path.model.find(query).remove().exec(fn);
        });
      });
      batch.end(next);
    });
  });
  return this;
};


/**
  * Add an api item's id to saving child item's 'api_ids'
  */

Api.prototype.setModelPostHooks = function() {
  var that = this;
  this.model.schema.post('save', function(item) {
    that.belongsToPaths.forEach(function(path){
      var id = item[path.name];
      if (!id) return
      path.model.findById(id, function(err, pathModelItem){
        pathModelItem[path.hasManyName].push(item._id);
        pathModelItem.save(function(err, pathModelItem) {
          if (err) throw err
        });
      });
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
  that.model.find({}, function(err, items) {
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

function Apis () {
  this.models = {};
  return this;
};

/**
  * Add `api`
  */
Apis.prototype.set = function(name, api) {
  this[name] = api;
  api.setApis(this);
  this.models[api.model.modelName] = api.model;
  return this;
};


/**
  * Get URIS
  */
Apis.prototype.getURIS = function() {
  var that = this
    , app = express();
  Object.keys(that).forEach(function(name){
    if (name == 'models') return
    app.use(that[name].getURIS());
  });
  return app;
};

/**
  * Module dependencies
  */
var Batch = require('batch');
var mongoose = require('mongoose');
var clone = require('component-clone');


/**
  * Expose `Apis`
  */

module.exports = Apis;


/**
  * Api
  */
function Api () {
}


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
  var self = this;
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
  * Set `apis` obj
  */
Api.prototype.setApis = function(apis) {
  this.apis = apis;
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
  * Get URIS
  */
Api.prototype.getURIS = function(app) {
  this
    .setSingularName()
    .setPluralName()
    .setBelongsToName()
    .setRemoveHook();
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
  // this.pluralName = this.model.collection.name;
  this.pluralName = this.singularName + 's';
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
  var self = this;
  this.model.schema.pre('remove', function(next) {
    var item = this;
    var batch = new Batch();
    Object.keys(self.apis.models).forEach(function(i){
      var model = self.apis.models[i];
      batch.push(function(fn) {
        var query = {};
        query[self.belongsToName] = item.id;
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
  * GET /`model`/
  */
Api.prototype.all = function(req, res, next) {

  var self = this;
  var conditions;
  var fields;
  var items;
  var total;
  var pages;
  var skip;
  var limit;

  if (req.query){
    conditions = req.query.conditions;
    if (req.query.options){
      skip = req.query.options.skip;
      limit = req.query.options.limit;
    }
  }

  var batch = new Batch;
  batch.push(function(done){

    if (!(skip != null && limit != null)) return done();

    var options = clone(req.query.options);
    delete options.skip;
    delete options.limit;
    delete options.sort;

    self
      .model
      .find(conditions, fields, options)
      .count(function(err, _total){
        total = _total;
        done(err);
      });

  });

  batch.push(function(done){

    var options = clone(req.query.options);
    self
      .model
      .find(conditions, fields, options)
      .exec(function(err, _items) {
        items = _items;
        done(err);
      });

  });

  batch.end(function(err){
    
    if (err) return next(err);
    
    if (!items) items = [];

    var records = [];
    var batch = new Batch();

    batch.concurrency(1);
    
    items.forEach(function(item) {
      batch.push(function(fn){
        item.__isReadable__(req, function(err) {
          if (err) return fn();
          records.push(self.filterJSON(item));
          fn();
        });
      });
    });

    batch.end(function(err){
      
      if (err && err !== false) return next(err);

      var json = {};
      json[self.pluralName] = records;

      if (total != null){

        var pages = Math.ceil(total / limit);

        json.meta = {
          pages: pages,
          total: total
        };

      }

      res.json(json);

    });

  });
};


/**
  * POST /`model`/
  */
Api.prototype.create = function(req, res, next) {
  if (req.body.query) {
    req.query = req.body.query;
    return this.all(req, res, next);
  }
  var self = this;
  var item = new self.model({});
  item.__isCreatable__(req, function(err) {
    if (err) return next(err);
    var data = req.body[self.singularName];
    for (var k in data){
      item[k] = data[k]; 
    }
    item.save(function(err, item) {
      if (err) return next(err);
      var json = {};
      json[self.singularName] = self.filterJSON(item);
      res.json(json);
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
    item.__isReadable__(req, function(err) {
      if (err) return next(err);
      var json = {};
      json[self.singularName] = self.filterJSON(item);
      res.json(json);
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
    item.__isUpdatable__(req, function(err) {
      if (err) return next(err);

      var data = req.body[self.singularName];
      for (var k in data){
        item[k] = data[k]; 
      }

      item.save(function(err, item) {
        if (err) return next(err);
        var json = {};
        json[self.singularName] = self.filterJSON(item);
        res.json(json);
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
    item.__isRemovable__(req, function(err) {
      if (err) return next(err);
      item.remove(function(err) {
        if (err) return next(err);
        res.json({});
      });
    });
  });
};


/**
  * Initialize new Apis for `models`
  */
function Apis (app, models) {
  if (!(this instanceof Apis)) return new Apis(app, models);
  var self = this;
  this.models = models;
  this.app = app;
  Object.keys(models).forEach(function(modelName){
    var model = models[modelName];
    var api = new Api();
    api.setModel(model);
    api.setApis(self);
    self[modelName] = api;
  });
  return this;
}


/**
  * Get URIS
  */
Apis.prototype.create = function() {
  var self = this;
  Object.keys(self).forEach(function(name){
    if (name == 'models' || name == 'app') return;
    self[name].getURIS(self.app);
  });
};

/**
  * Module dependencies.
  */
var fs = require('fs');
var join = require('path').join;
var Batch = require('batch');
var mongoose = require('mongoose');
var clone = require('component-clone');
var debug = require('debug')('em:apis');
var Api = require('./resource');


/**
  * Expose `Apis`
  */

module.exports = Apis;



/**
  * Init.
  */
function Apis (dirname) {
  if (!(this instanceof Apis)) return new Apis();
}


/**
 * Read `dirname`.
 *
 * @param {String} dirname  - path to dir
 * @returns {Object} hash of {fileName: modules}
 */
Apis.prototype.readPath = function(dirname){

  var mods = {};

  fs
    .readdirSync(dirname)
    .filter(function(file) {
      return !(/^\./.test(file));
    })
    .forEach(function(file){
      try{
        var mod = require(join(dirname, file));
      } catch (e){
        debug('failed to load mod %s %s', file, e.message);
        throw e;
      }
      mods[file.replace(/\.js$/, '')] = mod;
    });

  return mods;

};


/**
 * Register models.
 *
 * @param {Object} mongo    - mongoose connection instance
 * @param {String} dirname  - path to models dir
 * @returns {Apis} for chaining
 */
Apis.prototype.models = function(mongo, dirname){

  var self = this;
  
  self._models = self.readPath(dirname);

  for (var modelName in self._models){
    self._models[modelName] = mongo.model(modelName, self._models[modelName]);
  };

  return this;

};


/**
 * Register model fields.
 *
 * @param {String} dirname  - path to fields dir
 * @return {Apis} for chaining
 */
Apis.prototype.fields = function(dirname){

  var self = this;
  
  self._fields = self.readPath(dirname);

  return this;

};


/**
 * Register hooks.
 *
 * @param {String} dirname  - path to hooks dir
 * @return {Apis} for chaining
 */
Apis.prototype.hooks = function(dirname){

  var self = this;
  
  self._hooks = {
    pre: self.readPath(join(dirname, 'pre')),
    post: self.readPath(join(dirname, 'post')),
  };

  return this;

};


/**
  * Mount resources to `app`.
  */
Apis.prototype.discover = function(app) {

  var self = this;

  Object.keys(self._models).forEach(function(modelName){
    (new Api(self, modelName)).mount(app);
  });

  return this;

};

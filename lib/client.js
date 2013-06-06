// Generated by CoffeeScript 1.6.2
module.exports = DS.RESTAdapter.extend({
  init: function() {
    this._super();
    return this.set('serializer.primaryKey', function() {
      return '_id';
    });
  },
  findQuery: function(store, type, query, recordArray) {
    var root;

    root = this.rootForType(type);
    //console.log(query);
    return this.ajax(this.buildURL(root), "POST", {
      data: {
        q: query
      },
      success: function(json) {
        return Ember.run(this, function() {
          return this.didFindQuery(store, type, json, recordArray);
        });
      }
    });
  },
  findMany: function(store, type, ids, owner) {
    var root;

    root = this.rootForType(type);
    ids = this.serializeIds(ids);
    return this.ajax(this.buildURL(root), "POST", {
      data: {
        q: {
          _id: {
            $in: ids
          }
        }
      },
      success: function(json) {
        return Ember.run(this, function() {
          return this.didFindMany(store, type, json);
        });
      }
    });
  }
});
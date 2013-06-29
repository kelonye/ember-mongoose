module.exports = DS.RESTAdapter.extend({
  init: function() {
    this._super();
    this.set('serializer.primaryKey', function() {
      return '_id';
    });
  },
  findQuery: function(store, type, query, recordArray) {
    var root = this.rootForType(type);
    this.ajax(this.buildURL(root), 'POST', {
      data: {
        query: query
      },
      success: function(json) {
        Em.run(this, function() {
          this.didFindQuery(store, type, json, recordArray);
        });
      }
    });
  },
  findMany: function(store, type, ids, owner) {
    var root = this.rootForType(type);
    ids = this.serializeIds(ids);
    this.ajax(this.buildURL(root), 'POST', {
      data: {
        query: {
          c: {
            _id: {
              $in: ids
            }
          }
        }
      },
      success: function(json) {
        Em.run(this, function() {
          this.didFindMany(store, type, json);
        });
      }
    });
  }
});

module.exports = DS.RESTAdapter.extend({
  init: function() {
    this._super();
    this.set('serializer.primaryKey', function() {
      return '_id';
    });
  },
  findQuery: function(store, type, query, recordArray) {
    var root = this.rootForType(type);
    var adapter = this;
    var data = { query: query };
    return this.ajax(this.buildURL(root), 'POST', {
      data: data
    }).then(function(json){
      adapter.didFindQuery(store, type, json, recordArray);
    }).then(null, DS.rejectionHandler);
  },
  findMany: function(store, type, ids, owner) {
    var root = this.rootForType(type);
    var adapter = this;
    ids = this.serializeIds(ids);
    var data = {
      query: {
        c: {
          _id: {
            $in: ids
          }
        }
      }
    };
    return this.ajax(this.buildURL(root), "GET", {
      data: data
    }).then(function(json) {
      adapter.didFindMany(store, type, json);
    }).then(null, DS.rejectionHandler);
  }
});

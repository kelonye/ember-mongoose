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
  }
});

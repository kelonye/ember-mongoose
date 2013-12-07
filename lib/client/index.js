require('ember-data');

DS.RESTSerializer.reopen({
  primaryKey: '_id'
});

module.exports = DS.RESTAdapter.extend({
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

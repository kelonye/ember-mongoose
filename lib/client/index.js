/**
  * Module dependencies
  */
require('ember-data');

// primary key

DS.RESTSerializer.reopen({
  primaryKey: '_id'
});

// find query

module.exports = DS.RESTAdapter.extend({
  findQuery: function(store, type, query) {
    var data = { query: query };
    return this.ajax(this.buildURL(type.typeKey), 'POST', { data: data });
  }
});

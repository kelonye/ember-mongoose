/**
  * Module dependencies
  */
require('ember-data');


exports.Serializer = DS.RESTSerializer.extend({
  primaryKey: '_id'
});


exports.Adapter = DS.RESTAdapter.extend({

  pathForType: function(modelName) {
    return Em.String.pluralize(Em.String.dasherize(modelName));
  },

  query: function(store, type, query) {
    var url = this.buildURL(type.modelName)+'?query='+JSON.stringify(query);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.getJSON(url).then(function(data) {
        Ember.run(null, resolve, data);
      }, function(jqXHR) {
        jqXHR.then = null; // tame jQuery's ill mannered promises
        Ember.run(null, reject, jqXHR);
      });
    });
  }

});

var em = require('ember-mongoose');

App = Em.Application.create();

App.ApplicationSerializer = em.Serializer.extend();
App.ApplicationAdapter = em.Adapter.extend();

require('./models');
require('./routes');
require('./templates');

require('posts');

App.Router.map(function(){
  this.route('posts', function(){
    
  });
});

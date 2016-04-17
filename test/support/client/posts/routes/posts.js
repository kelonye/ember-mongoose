App.PostsRoute = Em.Route.extend({

  model: function(){
    return this.store.query('post', {
      conditions: {
        $and: [{
          title: 'b'
        }]
      }
    });
  },
  
});

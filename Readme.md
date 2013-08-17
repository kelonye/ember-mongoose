Install
---

    $ npm install ember-mongoose
    $ component install kelonye/ember-mongoose

<!--
Usage
---

```

// models.js

schema = new mongoose.Schema(
  {
    title: String,
    content: String
  } , {
    versionKey: false
  }
);
exports.Post = mongo.model('Post', schema);

// apis.js

var Api = require('ember-mongoose');

var api = new Api();

// name

api.name = 'Post';

// fields

api.fields = [
  'title',
  'content'
]

// set api permissions

api.perms.__isCreatable__ = function(req, done){
  done(null, 403);
}
api.perms.__isReadable__ = function(req, done){
  done(null, true);
}
api.perms.__isUpdatable__ = function(req, done){
  done(null, 403);
}
api.perms.__isRemovable__ = function(req, done){
  done(null, 403);
}

var app = module.exports = express();
app.use(api);

// server.js

var app = express();
app.use(require('./apis'));
app.listen(3000);


// client.js

App.Adapter = require('ember-mongoose');
App.Store = DS.Store.extend({
  adapter: 'App.Adapter'
});
```
-->

Test
---

    $ make test
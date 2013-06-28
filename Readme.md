Install
---

    $ npm install ember-mongoose
    $ component install kelonye/ember-mongoose

Example
---

  - [Blog](http://github.com/kelonye/blog)
  - [WCMS](http://github.com/kelonye/wcms)
  - [Pitchas](http://pitchas-kelonye.rhcloud.com)

Usage
---

```

// models.js

exports.Post = schema = new mongoose.Schema(
  {
    title: String,
    content: String
  } , {
    versionKey: false
  }
)

// set schema permissions

schema.methods.__isCreatable__ = function(req, cb){
  cb(null, 403);
}
schema.methods.__isReadable__ = function(req, cb){
  cb(null, true);
}
schema.methods.__isUpdatable__ = function(req, cb){
  cb(null, 403);
}
schema.methods.__isRemovable__ = function(req, cb){
  cb(null, 403);
}
exports.Post = mongo.model('Post', schema);

// apis.js

var embermongoose = require('ember-mongoose')
var models = require('./models');
var apis = embermongoose(models);

apis.Post.setPaths([
    'title'
  , 'content'
]);

module.exports = apis.getURIS();

// server.js

var express = require('express')
  , apis = require('./apis');
var app = express();
app.use(apis.getURIS());
app.listen(3000);


// client.js

App.Adapter = require('ember-mongoose');
App.Store = DS.Store.extend({
  adapter: 'App.Adapter'
});
```

Test
---

    $ make test
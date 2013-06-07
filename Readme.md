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

// server.js

var schema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now 
    },
    title: String,
    content: String,
    comment_ids: Array,
    tag_ids: Array
  } , {
    versionKey: false
  }
)
schema.methods.__isCreatable__ = function(req, cb){
  fn(null, 403);
}
schema.methods.__isReadable__ = function(req, cb){
  fn(null, true);
}
schema.methods.__isUpdatable__ = function(req, cb){
  fn(null, 403);
}
schema.methods.__isRemovable__ = function(req, cb){
  fn(null, 403);
}
Post = mongo.model('Post', schema);

...

var embermongoose = require('ember-mongoose')
  , models = [
    Post,
    User,
    Tag,
    Comment
  ]
  , app = express();
app.use(embermongoose(models));
app.listen(3000);

// client.js

App.Adapter = require('ember-mongoose');
App.Store = DS.Store.extend({
  revision: DS.CURRENT_API_REVISION,
  adapter: 'App.Adapter'
});
```

Test
---

    $ make test
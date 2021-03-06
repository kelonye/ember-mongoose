Expose mongoose models via an API compliant with the default [Ember Rest Adapter](http://emberjs.com/api/data/classes/DS.RESTAdapter.html)
---

Install
---

    $ npm install ember-mongoose
    $ component install kelonye/ember-mongoose

Example
---

### Server
To get started, suppose you have a model, `Post`:

```js

// server/models/Post.js

module.exports = new mongoose.Schema(
  {
    title: String,
    content: String
  }, {
    versionKey: false
  }
);

```

To expose this model, via an API, first define the `CRUD` auth hooks as:

```js
// server/api_hooks/pre/Post.js

exports.create = function(req, next){
  
  var err;
  
  if (!(req.isAuthenticated() && req.user)) { // assuming you're using passport.js
    err = new Error('not allowed to access this resource');
    err.status = 403;
  }

  console.log(req.body.post);

  next(err);

};

exports.read = function(req, next){
  next();
};

exports.update = function (req, next){ 
  var err = new Error('not allowed to access this resource');
  err.status = 403;
  next(err);
};

exports.remove = function (req, next){ 
  var err = new Error('not allowed to access this resource');
  err.status = 403;
  next(err);
};

```

You also need to specify the fields to expose as:

```js
// server/api_fields/Post.js

module.exports = [
  'title',
  'content',
];

```

Finally, build and mount the API to your Express app:

```js
var join = require('path').join;
var express = require('express');
var db = require('mongoose').createConnection('mongodb://localhost/test');
var em = require('ember-mongoose');
var app = express();

// build api

em()
  .models(db, join(__dirname, 'server/models'))
  .fields(join(__dirname, 'server/api_fields'))
  .hooks(join(__dirname, 'server/api_hooks'));
  .discover(app);

app.listen(3000);

```

With this, you can now access the `Post` resource e.g.:

    $ curl http://localhost:3000/posts
    
    $ curl
      -H "Content-Type: application/json"
      -X POST
      -d '"post": {{"title":"title","content":""}}'
      http://localhost:3000/posts
    
    $ curl http://localhost:3000/posts/1

    $ curl
      -H "Content-Type: application/json"
      -X PUT
      -d '"post": {{"title":"title","content":""}}'
      http://localhost:3000/posts/1

    $ curl -X DELETE http://localhost:3000/posts/1

### Client

On client side, assuming you're using [component](http://github.com/component/component) package manager, you can set your app's adapter as:

```js

App.ApplicationAdapter = require('ember-mongoose');

```

or alternatively, use `lib/client/index.js` if not.


Finally, you can then use the `Ember-Data` store to perfom API calls, e.g.:

```js

App.Post = DS.Model.extend({
  title: DS.attr('string'),
  content: DS.attr('string'),
});

// pass query to mongoose

var query = 
  conditions: {
    title: 'title'
  },
  options: {
    skip: 0, // start row
    limit: 10, // end row
    sort: {
      created_at: -1 // order by latest
    }
  }
};

this
  .store
  .find('post', query)
  .then(function(posts){
    console.log(posts);
  }, funntion(res){
    console.log(res.responseText);
  });

// create example

var record = {
  title: 'My First Post',
  content: '',
};

this
  .store
  .createRecord('post', record)
  .save()
  .then(function(post){
    console.log(post);
  }, funntion(res){
    console.log(res.responseText);
  });

```

#### Get query count

To only retrieve the number of documents in a query, passin the `count` option as:

```js

var query = 
  conditions: {
    title: 'title'
  },
  options: {
    count: true
  }
};

this
  .store
  .find('post', query)
  .then(function(res){
    console.log(res.meta.count);
  }, funntion(res){
    console.log(res.responseText);
  });
```

For more usage example, see `test/support`

Test
---

    $ make test

Similar
---

- [ember-orm](https://github.com/kelonye/ember-orm)

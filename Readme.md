Install
---

    $ npm install git+https://github.com/kelonye/ember-mongoose.git
    $ component install kelonye/ember-mongoose

Example
---

  - [Blog](http://github.com/kelonye/blog)

Usage
---

```

# server.coffee

embermongoose = require 'ember-mongoose'
models = [
  Post
  User
  Tag
  Comment
]
app = express()
app.use embermongoose models
app.listen 3000

# client.coffee

App.Adapter = require 'ember-mongoose'
App.Store = DS.Store.extend
  revision: DS.CURRENT_API_REVISION
  adapter: 'App.Adapter'

```

Test
---

    $ make test
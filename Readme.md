Install
---

    $ npm install ember-mongoose
    $ component install kelonye/ember-mongoose

Example
---

See `test/support`

Test
---

    $ make test

Ember-data query example
---

```js

this
  .store
  .find('model', {
    conditions: {
      category: 'category_id'
    },
    options: {
      skip: 0, // starting row
      limit: 10, // ending row
      sort: {
        created_at: -1 // order by latest
      }
    }
  });

```

Similar
---

- [ember-orm](https://github.com/kelonye/ember-orm)

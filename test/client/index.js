var Person
  , adapter
  , ajaxHash
  , ajaxType
  , ajaxUrl
  , expect
  , expectData
  , expectState
  , expectStates
  , expectType
  , expectUrl
  , people
  , person
  , store;

expect = function(a, b) {
  assert.equal(a, b);
};

expectUrl = function(url) {
  expect(ajaxUrl, url);
};

expectType = function(type) {
  expect(ajaxType, type);
};

expectData = function(hash) {
  assert.deepEqual(ajaxHash.data, hash);
};

expectState = function(state, value, p) {
  p = p || person;
  if (value === undefined) {
    value = true;
  }
  var flag = 'is' + state.charAt(0).toUpperCase() + state.substr(1);
  var hasState = get(p, flag);
  if (value === true) {
    expect(hasState, true);
  } else {
    expect(hasState, false);
  }
};

expectStates = function(state, value) {
  people.forEach(function(person) {
    expect(state, value, person);
  });
};

describe('Adapter', function() {
  beforeEach(function() {
    ajaxUrl = undefined;
    ajaxType = undefined;
    ajaxHash = undefined;
    adapter = Adapter.create({
      ajax: function(url, type, hash) {
        var that = this;
        if (hash.data && type === 'GET') {
          url += "&" + Em.$.param(hash.data);
        }
        var success = hash.success;
        ajaxUrl = url;
        ajaxType = type;
        ajaxHash = hash;
        if (success) {
          hash.success = function(json) {
            success.call(that, json);
          };
        }
      }
    });
    store = DS.Store.create({
      revision: DS.CURRENT_API_REVISION,
      adapter: adapter
    });
    Person = DS.Model.extend({
      name: DS.attr('string')
    });
    Person.toString = function() {
      return 'App.Person';
    };
  });
  afterEach(function() {
    adapter.destroy();
    store.destroy();
    person = null;
    people = null;
  });
  describe('#findMany', function() {
    it('makes a GET and returns matched items', function(done) {
      people = store.findMany(Person, ['1', '2']);
      expectUrl('/persons');
      expectType('POST');
      ajaxHash.success({
        persons: [
          {
            _id: '1',
            name: 'Yehuda'
          }, {
            _id: '2',
            name: 'TJ'
          }
        ]
      });
      expect(people.get('length'), 2);
      person = people.objectAt(0);
      expect(person.get('id'), '1');
      person = store.find(Person, 1);
      expect(person.get('id'), '1');
      done();
    });
  });
  describe('#findQuery', function() {
    it('makes a POST and returns matched items', function(done) {
      var name = 'Yehuda Katz';
      var data = {
        c: {
          name: name
        },
        s: {
          
        }
      };
      people = store.find(Person, data);
      expectStates('loaded', false);
      expectUrl('/persons');
      expectType('POST');
      ajaxHash.success({
        persons: [
          {
            _id: '1',
            name: name
          }
        ]
      });
      expect(people.get('length'), 1);
      person = people.objectAt(0);
      expect(person.get('id'), '1');
      person = store.find(Person, 1);
      expect(person.get('id'), '1');
      done();
    });
  });
});

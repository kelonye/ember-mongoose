
# tests reimplemented findMany and findQuery

adapter = undefined
store = undefined
ajaxUrl = undefined
ajaxType = undefined
ajaxHash = undefined
Person = undefined
person = undefined
people = undefined

expect = (a,b) ->
  assert.equal a, b

expectUrl = (url) ->
  expect ajaxUrl, url

expectType = (type) ->
  expect ajaxType, type

expectData = (hash) ->
  assert.deepEqual ajaxHash.data, hash

expectState = (state, value, p) ->
  p = p or person
  value = true  if value is `undefined`
  flag = 'is' + state.charAt(0).toUpperCase() + state.substr(1)
  hasState = get(p, flag)

  if value is true
    expect hasState, true
  else
    expect hasState, false

expectStates = (state, value) ->
  people.forEach (person) ->
    expect state, value, person

describe 'Adapter', ->

  beforeEach ->

    ajaxUrl = undefined
    ajaxType = undefined
    ajaxHash = undefined

    adapter = Adapter.create
      ajax: (url, type, hash) ->
        that = @

        if hash.data and type is 'GET'
          url += "&" + Em.$.param hash.data

        success = hash.success
        ajaxUrl = url
        ajaxType = type
        ajaxHash = hash
        
        #console.log url

        if success
          hash.success = (json)->
            success.call that, json

    store = DS.Store.create
      revision: DS.CURRENT_API_REVISION
      adapter: adapter


    Person = DS.Model.extend
      name: DS.attr 'string'
    Person.toString = ->
      'App.Person'
  
  afterEach ->

    adapter.destroy()
    store.destroy()
    person = null
    people = null

  describe 'findMany', ->
    it 'makes a GET and returns matched items', (done) ->
      people = store.findMany Person, ['1', '2']
      #expectStates 'loaded', false
      # the plural of the model name with the ID requested
      expectUrl '/persons'
      expectType 'POST'
      #expectData
      #  _id:
      #    $in: [ '1', '2' ]
      ajaxHash.success
        persons: [
          {
            _id: '1'
            name: 'Yehuda'
          }, {
            _id: '2'
            name: 'TJ'
          }
        ]

      # #expectState 'loaded'

      expect people.get('length'), 2
      person = people.objectAt 0
      expect person.get('id' ), '1'

      # # 'the record is now in the store, and can be looked up by ID without another Ajax request'
      person = store.find(Person, 1)
      expect person.get('id' ), '1'

      done()

  describe '#findQuery', ->
    it 'makes a POST and returns matched items', (done) ->
      name = 'Yehuda Katz'
      data = 
        name: name
      people = store.find Person, data
      expectStates 'loaded', false
      # the plural of the model name with the ID requested
      expectUrl '/persons'
      expectType 'POST'
      ajaxHash.success
        persons: [
          {
            _id: '1'
            name: name
          }
        ]

      #expectState 'loaded'

      expect people.get('length'), 1
      person = people.objectAt 0
      expect person.get('id' ), '1'

      # 'the record is now in the store, and can be looked up by ID without another Ajax request'
      person = store.find(Person, 1)
      expect person.get('id' ), '1'

      done()
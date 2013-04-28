module.exports = DS.RESTAdapter.extend
  
  init: ->
    @_super()
    @set 'serializer.primaryKey', ->
      '_id'

    # namespace = @get 'namespace'
    # Em.assert 'namespace required', !!namespace
    # serializer = @get 'serializer'
    # set serializer, 'adapter', @
    # set serializer, 'namespace', namespace

  findQuery: (store, type, query, recordArray) ->
    root = @rootForType(type)
    @ajax @buildURL(root), "POST",
      data:
        q: query
      success: (json) ->
        Ember.run this, ->
          @didFindQuery store, type, json, recordArray

  findMany: (store, type, ids, owner) ->
    root = @rootForType(type)
    ids = @serializeIds(ids)
    @ajax @buildURL(root), "POST",
      data:
        q:
          _id: 
            $in: ids
      success: (json) ->
        Ember.run this, ->
          @didFindMany store, type, json

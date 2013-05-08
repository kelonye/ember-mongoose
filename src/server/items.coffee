module.exports = (model)->

  l = console.log 

  Batch = require 'batch'

  items = {}

  Model = model.Model
  singular = model.singularName
  plural = model.pluralName

  # Model.schema.pre 'save', (next) ->
  #   # default hasMany's as empty array
  #   for m in model.hasManyPaths
  #     @[m.hasManyName] ?= []
  #   next()

  Model.schema.post 'save', (item) ->
    # add belongsTo path id to hasManys
    for m in model.belongsToPaths
      id = item[m.belongsToName]
      if id
        m.Model.findById id, (err, mItem) ->
          return throw err if err
          mItem[model.hasManyName].push item.id
          mItem.save (err) ->
            return throw err if err 

  Model.schema.pre 'remove', (next) ->

    if model.belongsToPaths.length == model.hasManyPaths.length == 0
      return next()

    else

      that = @

      # remove id from .hasManys of other records
      # "if anyone contains me .."
      batch = new Batch

      for m in model.belongsToPaths
        do (m)->
          id = that[m.belongsToName]
          if id
            batch.push (fn)->
              m.Model.findById id, (err, item) ->
                return fn err if err
                item[model.hasManyName].remove that.id
                item.save (err)->
                  if err and err.message == 'No matching document found.'
                    err = null
                  fn err

      batch.end (err)->

        return next err if err
        # remove records that belong to item
        # "if anyone points to me ..."
        batch = new Batch

        for m in model.hasManyPaths
          do (m)->
            batch.push (fn)->
              query = {}
              query[model.belongsToName] = that.id
              m.Model.find(query).remove fn

        batch.end next



  items.all = (req, res) ->
    
    Model.find req.query, (err, items) ->
      return res.send err if err

      items ?= []

      array = items.filter (item) ->
        item.__isReadable__ req, (err, can) ->
          return throw err if err
          if can != true
            return false
          true

      json = {}
      json[plural] = array
      res.send json

  items.create = (req, res) ->

    # request is a query
    if req.body.q
      req.query = req.body.q
      return items.all req, res

    item = new Model req.body[singular]

    item.__isCreatable__ req, (err, can) ->
      return res.send err if err
      if can != true
        return res.send can
      
      item.save (err, item) ->
        return res.send err if err

        json = {}
        json[singular] = item
        res.send json

  items.one = (req, res) ->
    Model.findById req.params.id, (err, item) ->
      return res.send err if err

      item.__isReadable__ req, (err, can) ->
        return res.send err if err
        if can != true
          return res.send can

        json = {}
        json[singular] = item
        res.send json

  items.update = (req, res) ->
    Model.findByIdAndUpdate req.params.id, req.body[singular], (err, item) ->
      return res.send err if err

      item.__isUpdatable__ req, (err, can) ->
        return res.send err if err
        if can != true
          return res.send can

        json = {}
        json[singular] = item
        res.send json

  items.remove = (req, res) ->
     Model.findById req.params.id, (err, item) ->
      return res.send err if err
      item.__isRemovable__ req, (err, can) ->
        return res.send err if err
        if can != true
          return res.send can
        item.remove (err) ->
          return res.send err if err
          res.send {}
    
  items
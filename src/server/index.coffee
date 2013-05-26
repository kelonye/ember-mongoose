express = require 'express'
utils = require './utils'

module.exports = (modelsArray) ->
  
  app = express()

  modelsHash = {}
  for m in modelsArray
    #m.schema.set 'versionKey', false
    modelsHash[m.modelName.toLowerCase()] = utils.makeModelObj m

  for name, m of modelsHash
    utils.setAssociations modelsHash, name

  for name, m of modelsHash

    items = m.items
    plural = m.pluralName

    app.get "/#{plural}", items.all
    app.post "/#{plural}", items.create
    app.get "/#{plural}/:id", items.one
    app.put "/#{plural}/:id", items.update
    app.del "/#{plural}/:id", items.remove

  app

items = require './items'

exports.makeModelObj = (model)->
  obj = {}
  obj.Model = model
  obj.singularName = model.modelName.toLowerCase()#dasherize
  obj.pluralName = model.collection.name
  obj.belongsToName = "#{obj.singularName}_id"
  obj.hasManyName = "#{obj.singularName}_ids"
  obj

exports.setAssociations = (modelsHash, modelName)->

  modelObj = modelsHash[modelName]
  schema = modelObj.Model.schema

  hasManyPaths = []
  belongsToPaths = []

  for k in Object.keys(schema.paths)

    # find belongsTo
    if k.slice(-3) == '_id'
      modelName = k.slice 0, (k.length - 3)
      if k != '_id'
        belongsToPaths.push modelsHash[modelName]

    # match hasMany
    else if k.slice(-4) == '_ids'
      modelName = k.slice 0, (k.length - 4)
      hasManyPaths.push modelsHash[modelName]

  modelObj.hasManyPaths = hasManyPaths
  modelObj.belongsToPaths = belongsToPaths
  modelObj.items = items modelObj

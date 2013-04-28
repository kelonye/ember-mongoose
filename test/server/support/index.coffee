express = require 'express'

embermongoose = require '../../../'
global.mongo = require './mongo'
models = require './models'

app = module.exports = express()
app.use express.favicon()
app.use express.cookieParser()
app.use express.bodyParser()
app.use express.methodOverride()
app.use require './session'
app.use require './strategy'
app.use embermongoose [
  models.Tag
  models.User
  models.Post
  models.Comment
]
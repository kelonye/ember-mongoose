# mock passportjs auth strategy
express = require 'express'
app = module.exports = express()
app.use (req, res, next) ->
  req.isAuthenticated = ->
    true
  req.user = user
  next()
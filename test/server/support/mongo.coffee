mongoose = require 'mongoose'
uri = 'mongodb://localhost/test'
module.exports = mongoose.createConnection uri

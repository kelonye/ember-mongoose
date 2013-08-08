var mongoose = require('mongoose');
var uri = 'mongodb://localhost/test';
module.exports = mongoose.createConnection(uri);

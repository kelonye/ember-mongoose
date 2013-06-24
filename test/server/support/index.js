var express = require('express')
  , mongo = require('./mongo');

global.mongo = mongo;

app = module.exports = express();
app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(require('./session'));
app.use(require('./strategy'));
app.use(require('./apis'));

if (!module.parent){
  app.listen(3000);
  console.log('http://dev:3000');
}
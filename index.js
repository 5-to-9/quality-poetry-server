var express = require('express');
var bodyParser = require('body-parser');
var gen_functions = require('./inc/generation_functions.js');

var app = express();
app.use(bodyParser.json({ type: 'application/json' }));

var router = express.Router();

router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/', router);

router.get('/create', create_poem, function (req, res){});

function create_poem(req,res,next){
  var type = "basic";
  var result = gen_functions.generateBasic(type);
  res.send(result);
}

module.exports = app;

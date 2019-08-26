var express = require('express');
var bodyParser = require('body-parser');
var gen_functions = require('./inc/generation_functions.js');

var app = express();
app.use(bodyParser.json({ type: 'application/json' }));

var router = express.Router();

// CORS headers
router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/', router);

// Fetches a new poem
router.get('/create', create_poem, function (req, res){});
// router.get('/line', create_poem, function (req, res){});

router.get('/favicon.ico', (req, res) => res.status(204));

// helper function for the /create route.
function create_poem(req,res,next) {
  var author = req.query.author;
  var mood = req.query.mood;

  var result = gen_functions.returnPoem(author, mood, function(result){
    res.send(result);
  });
}

function create_line(req,res,next) {
  var result = gen_functions.returnLine(type, function(result){
    res.send(result);
  });
}

module.exports = app;

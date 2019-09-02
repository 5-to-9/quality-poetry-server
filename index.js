var express = require('express');
var bodyParser = require('body-parser');
var generationFunctions = require('./inc/generation_functions.js');

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
router.get('/create', generatePoem, function (req, res){});

// Fetches the line of a poem
// router.get('/line', generateLine, function (req, res){});

// Precents favicon 404 noise in the error log
router.get('/favicon.ico', (req, res) => res.status(204));

// helper function for the /create route.
function generatePoem(req, res, next) {
    var author = req.query.author;
    var mood = req.query.mood;

    var result = generationFunctions.returnPoem(author, mood, function(result){
        res.send(result);
    });
}

// helper function for the /line route.
function generateLine(req,res,next) {
    var result = generationFunctions.returnLine(type, function(result){
        res.send(result);
    });
}

module.exports = app;

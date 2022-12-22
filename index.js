var express = require('express')

var app = express()

var v1router = require('./routes/v1');
var v2router = require('./routes/v2');
var v3router = require('./routes/v3');

app.use('/', v1router)
app.use('/v2', v2router);
app.use('/v3', v3router);

module.exports = app

var express = require('express')
var router = express.Router()
var generationFunctions = require('../inc/v3/generationFunctions.js')

router.get('/create/poem', function(req, res, next) {
  var result = generationFunctions.getPoetryResponse(function(result) {
    res.send(result)
  })
})

module.exports = router

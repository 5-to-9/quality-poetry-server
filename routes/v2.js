var express = require('express')
var router = express.Router()
var generationFunctions = require('../inc/v2/generationFunctions.js')

router.get('/create/poem', function(req, res, next) {
  var result = generationFunctions.returnPoem(function(result) {
    res.send(result)
  })
})

module.exports = router

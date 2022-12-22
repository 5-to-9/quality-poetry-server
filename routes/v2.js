var express = require('express')
var router = express.Router()
var generationFunctions = require('../inc/v2/generationFunctions.js')

// CORS headers
router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  // res.setHeader('Access-Control-Allow-Credentials', true)

  next()
})

router.get('/create/poem', function(req, res, next) {
  generationFunctions.returnPoem(function(result) {
    res.send(result)
  })
})

module.exports = router

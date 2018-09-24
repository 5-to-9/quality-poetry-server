var fs = require('fs');
var async = require('async');

module.exports = {
  generateBasic: function (type) {
    return generatePoem(type);
  },
  c: function (var_to_print) {
    console.log(var_to_print);
  }
};

var generatePoem = function (type) {
  var dirPath = "./src/dictionary";
  var sampleFile = dirPath + "/verb.json";
  var sampleFileTwo = dirPath + "/noun.json";

  var files = [sampleFile, sampleFileTwo];

  async.map(files, readAsync, function(err, results) {
    console.log(results);
  });

  var result = {
    "poem_type": type,
    "line1": "hello there",
    "line2": "this is a poem"
  };

  // doAsync(fs).readdir("./src/dictionary")
  //   .then((data) => console.log(data)));

  return result;
}

function readAsync(file, callback) {
  fs.readFile(file, 'utf8', callback);
}

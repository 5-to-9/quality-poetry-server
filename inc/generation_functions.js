var fs = require('fs');

module.exports = {
  generateBasic: function (type, callback) {
    return generatePoem(type, function(data){
      return callback(data);
    });
  },
  c: function (var_to_print) {
    console.log(var_to_print);
  }
};

function generatePoem (type, callback) {
  var dirPath = "./src/dictionary";
  var phrasebook = dirPath + "/phrases.json";
  var dictionary = dirPath + "/dictionary.json";

  fs.readFile(phrasebook, 'utf8', function(phraseErr, phrases) {
    fs.readFile(dictionary, 'utf8', function(dictErr, words) {
      // console.log(phrases);
      // console.log(dictionary);
      // return callback(phrases);
      return callback(phrases);
    })
  });

  // console.log("here");
  //
  // let dictionary;
  // try {
  //   dictionary = fs.readFileSync('./src/dictionary/dictionary.json', 'utf-8');
  // } catch (ex) {
  //   console.log(ex)
  // }
  // console.log(dictionary);
  //
  // return dictionary;

  // var result = {
  //   "poem_type": type,
  //   "line1": "hello there",
  //   "line2": "this is a poem"
  // };

  // return result;
}
